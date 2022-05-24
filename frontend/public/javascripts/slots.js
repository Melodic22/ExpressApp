//data passed from backend
console.log(slots);

const tableBody = document.getElementById('js-table-body');

showSlots(slots);

function confirmSlotBooking(slot) {

    if (confirm(`Please confirm your booking \nfrom ${slot.time_start} to ${slot.time_finish} \nwith ${slot.firstname} ${slot.lastname} \n(${slot.email})`)) {

                //send POST request to backend
                console.log(slot);
                fetch('/slots/confirm-slot', {
                    method: 'POST',
                    headers: {
                        'Accept' : 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(slot)
                })
                .then(response => {
                    console.log('received response');
                    if (response.status === 201) {  //request successful
                        console.log('response successful');
                        alert(`Your meeting has been confirmed. \nAn email has been sent to your email address at ${email} \nand ${slot.firstname}'s email at ${slot.email}`);
                        //redirect to calendar 
                        window.location.href = "http://localhost:5000/calendar" 
                    }
                })
                .catch((error) => {     //request not successful
                    console.log('Error:', error);
                    alert('An error has occured while booking your slot');
                });

                //redirect to calendar 
                // window.location.href = "http://localhost:5000/calendar" 
    } else {
        //cancel selected
        alert(`Your meeting has been cancelled.`);
    }
};

function checkIfSlotsEmpty() {
    if (slots.length === 0) {
        alert('There are no available slots to book right now. Please try again later.');
    };
};


function showSlots(slots) {


    seenStaff = [];

    slots.forEach(slot => {
        //if staff member seen before
        if (seenStaff.indexOf(slot.staff_id) !== -1) {
            let index = seenStaff.indexOf(slot.staff_id);
            let currentData = document.getElementById(`js-data-no-${slot.staff_id}`);

            const slotButton = document.createElement('button');
            slotButton.classList.add('slotButton');
            slotButton.innerText = `${slot.date}\n${slot.time_start} to ${slot.time_finish}`;
            currentData.appendChild(slotButton);
            slotButton.addEventListener('click', () => confirmSlotBooking(slot));

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
            slotButton.addEventListener('click', () => confirmSlotBooking(slot));

            head.innerText = `${slot.firstname} ${slot.lastname}\n${slot.email}`;
            // data.innerText = `${slot.time_start} to ${slot.time_finish}`;
            slotButton.innerText = `${slot.date}\n${slot.time_start} to ${slot.time_finish}`;
            //add staff_id to seen staff array
            seenStaff.push(slot.staff_id);
        }
    });
    

}

/* Toggle between adding and removing the "responsive" class to topnav when the user clicks on the icon */
function toggleNav() {
    var x = document.getElementById("myTopnav");
    if (x.className === "topnav") {
        x.className += " responsive";
    } else {
        x.className = "topnav";
    }
}