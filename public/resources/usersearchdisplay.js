document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('searchform').addEventListener('submit', fetchResults);
});

function swapsearch() {
    const acctype = document.getElementById("acctype").value;
    const studentyear = document.getElementById("studentyear");
    const facultyrank = document.getElementById("facultyrank");
    const positionlabel = document.getElementById("positionlabel");

    if (acctype === "Student") {
        facultyrank.style.display = "none";
        studentyear.style.display = "block";
        positionlabel.innerText = "Year:";
    } else {
        studentyear.style.display = "none";
        facultyrank.style.display = "block";
        positionlabel.innerText = "Rank:";
    }
}

function clearInputs() {
    document.getElementById("fname").value = '';
    document.getElementById("lname").value = '';
    document.getElementById("dob").value = '';
    document.getElementById("email").value = '';
}

function fetchResults(event) {
    event.preventDefault();
    
    const form = document.getElementById('searchform');
    const formData = new FormData(form);
    
    // Log the form data for debugging
    console.log('Form data:', Array.from(formData.entries()));
    
    fetch('/usersearch', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(results => {
        const wrapper = document.getElementById('results');
        wrapper.innerHTML = '';

        if (results.length > 0) {
            results.forEach(res => {
                const dob = res.dob ? new Date(res.dob).toLocaleDateString() : '';
                const name = `${res.fname} ${res.lname}`;
                const rank = res.acctype == 3 ? fixStudentYear(res.studentyear) : res.facultyrank;
                const row = document.createElement('span');
                row.innerHTML = `
                    <form method="get" action="/edit_account/${res.email}">
                        <input type="hidden" name="email" value="${res.email}">
                        <table class="search_table">
                            <tr>
                                <td class="search_results_output">${name}</td>
                                <td class="search_results_output">${dob}</td>
                                <td class="search_results_output">${res.email}</td>
                                <td class="search_results_output">${rank}</td>
                                <td class="search_results_output"><button name="Edit" id="Edit" type="submit">Edit</button></td>
                            </tr>
                        </table>
                    </form>`;
                wrapper.appendChild(row);
            });
        } else {
            wrapper.innerHTML = 'No results found';
        }
    })
    .catch(error => console.error('Error:', error));
}

function fixStudentYear(year) {
    switch(year) {
        case '1':
            return 'Freshman';
        case '2':
            return 'Sophomore';
        case '3':
            return 'Junior';
        case '4':
            return 'Senior';
        default:
            return '';
    }
}
