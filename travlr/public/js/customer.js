'use strict';
const status = document.querySelector('#customer-status');
const token = () => sessionStorage.getItem('travlr-customer-token') || '';
function message(text) { if (status) status.textContent = text; }
async function api(url, options = {}) {
 const headers = {'Content-Type': 'application/json'};
 if(token()) headers.Authorization = `Bearer ${token()}`;
 const response = await fetch(url, {...options, headers});
 const result = response.status === 204 ? null : await response.json();
 if(!response.ok) {
  if(response.status === 401) sessionStorage.removeItem('travlr-customer-token');
  throw new Error(result?.error || 'Request failed');
 }
 return result;
}
for(const [id, endpoint] of [['customer-login', 'login'], ['customer-register', 'register']]) {
 const form = document.getElementById(id);
 form?.addEventListener('submit', async event => {
  event.preventDefault(); const button = form.querySelector('button'); button.disabled = true;
  try {
   const result = await api('/api/' + endpoint, {method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(form)))});
   sessionStorage.setItem('travlr-customer-token', result.token); form.reset(); window.location.assign('/itinerary');
  } catch(error) {message(error.message);} finally {button.disabled = false;}
 });
}
const logout = document.getElementById('customer-logout');
if(logout) {logout.hidden = !token(); logout.addEventListener('click', () => {sessionStorage.removeItem('travlr-customer-token'); logout.hidden = true; message('You are logged out.');});}
for(const button of document.querySelectorAll('.book-trip')) button.addEventListener('click', async () => {
 if(!token()) {window.location.assign('/account'); return;}
 button.disabled = true;
 try {await api('/api/reservations', {method: 'POST', body: JSON.stringify({tripCode: button.dataset.code})}); window.location.assign('/itinerary');}
 catch(error) {message(error.message); button.disabled = false;}
});
async function loadItinerary() {
 const list = document.getElementById('itinerary-list'); if(!list) return;
 if(!token()) {message('Log in to view your itinerary.'); const a=document.createElement('a'); a.href='/account'; a.textContent='Log in or create an account'; list.replaceChildren(a); return;}
 try {
  const reservations = await api('/api/reservations'); list.replaceChildren();
  if(!reservations.length) message('No reservations yet. Browse trips to book your first getaway.');
  for(const item of reservations) {
   const section=document.createElement('section'); section.className='reservation';
   const title=document.createElement('h2'); title.textContent=item.name;
   const details=document.createElement('p'); details.textContent=`${item.resort} | ${item.length} | ${item.perPerson} per person`;
   const date=document.createElement('p'); date.textContent='Departure: ' + new Date(item.start).toLocaleDateString('en-US', {timeZone: 'UTC'}) + ' | Status: ' + item.status;
   section.append(title, details, date);
   if(item.status === 'booked') {const button=document.createElement('button'); button.textContent='Cancel reservation'; button.addEventListener('click', async () => {
    if(!window.confirm('Cancel this reservation?')) return;
    button.disabled=true;
    try {await api('/api/reservations/'+item._id, {method:'DELETE'}); await loadItinerary(); message('Reservation cancelled.');}
    catch(error) {message(error.message); button.disabled=false;}
   }); section.append(button);}
   list.append(section);
  }
 } catch(error) {message(error.message + '. Log in again if your session expired.');}
}
void loadItinerary();
