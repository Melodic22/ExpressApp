
//loop through availableSlots


//data will already be ordered by staff_id

/* 
for each availableSlot
    if staff_id seen before
        add slot to current row in table
    else
        create new row in table
        add slot to current row in table
        add current staff_id to seen before

*/

//for each availableslot
//      if staff_id seen before
//          find index of staff_id in seen_staff
//          add slot to the row[index]
//      else
//          then add new row with staff_name and add current slot to that row
//          add staff_id to list of seen_staff

//data passed from backend
console.log(slots);

const tableBody = document.getElementById('js-table-body');

showSlots(slots);

function showSlots(slots) {

    seenStaff = [];

    slots.forEach(slot => {
        //if staff member seen before
        if (seenStaff.indexOf(slot.staff_id) !== -1) {
            let index = seenStaff.indexOf(slot.staff_id);
            let currentData = document.getElementById(`js-data-no-${slot.staff_id}`);

            const slotButton = document.createElement('button');
            slotButton.classList.add('slotButton');
            slotButton.innerText = `${slot.time_start} to ${slot.time_finish}`;
            currentData.appendChild(slotButton);

            //currentData.innerText = currentData.innerText + `, ${slot.time_start} to ${slot.time_finish}`;
        } else {
            //add new row
            const row = document.createElement('tr');
            row.id = `js-staff-no-${slot.staff_id}`;
            tableBody.appendChild(row);
            const head = document.createElement('th');
            head.id = `js-head-no-${slot.staff_id}`;
            row.appendChild(head);
            const data = document.createElement('td');
            data.id = `js-data-no-${slot.staff_id}`;
            row.appendChild(data);
            const slotButton = document.createElement('button');
            slotButton.classList.add('slotButton');
            slotButton.id = `js-slot-button-no-${slot.staff_id}`;
            data.appendChild(slotButton);

            head.innerText = `${slot.firstname}\n${slot.email}`;
            // data.innerText = `${slot.time_start} to ${slot.time_finish}`;
            slotButton.innerText = `${slot.time_start} to ${slot.time_finish}`;
            //add staff_id to seen staff array
            seenStaff.push(slot.staff_id);
        }
    });

}