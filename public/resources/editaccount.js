document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');

    if (email) {
        fetch(`/edit_account/${email}`)
            .then(response => response.json())
            .then(data => {
                document.getElementById('acctype').value = data.acctype;
                document.getElementById('fname').value = data.fname;
                document.getElementById('lname').value = data.lname;
                document.getElementById('dob').value = data.dob;
                document.getElementById('email').value = data.email;
                document.getElementById('confirmemail').value = data.email;
                document.getElementById('password').value = ''; // For security reasons, don't prefill the password
                document.getElementById('confirmpassword').value = ''; // For security reasons, don't prefill the password
                document.getElementById('squestion').value = data.squestion;
                document.getElementById('sanswer').value = data.sanswer;

                if (data.acctype == "3") {
                    document.getElementById('studentyear').style.display = "block";
                    document.getElementById('facultyrank').style.display = "none";
                    document.getElementById('studentyear').value = data.studentyear;
                } else {
                    document.getElementById('studentyear').style.display = "none";
                    document.getElementById('facultyrank').style.display = "block";
                    document.getElementById('facultyrank').value = data.facultyrank;
                }

                // Store the previous email in a hidden input field for form submission
                document.getElementById('prevemail').value = data.email;
            })
            .catch(error => console.error('Error fetching user data:', error));
    }
});

function swapselection() {
    const acctype = document.getElementById("acctype").value;
    const studentyear = document.getElementById("studentyear");
    const facultyrank = document.getElementById("facultyrank");
    const positionlabel = document.getElementById("positionlabel");

    if (acctype === "3") {  // 3 for Student
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
    document.getElementById("confirmemail").value = '';
    document.getElementById("password").value = '';
    document.getElementById("confirmpassword").value = '';
    document.getElementById("squestion").value = '';
    document.getElementById("sanswer").value = '';
}

function submitAccount(event) {
    event.preventDefault();

    const form = document.getElementById('editaccform');
    const formData = new FormData(form);

    fetch(`/edit_account/${formData.get('email')}`, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.ok) {
            window.location.href = '/usersearch';
        } else {
            return response.text().then(text => { throw new Error(text); });
        }
    })
    .catch(error => {
        document.getElementById('submiterror').style.display = 'block';
        document.getElementById('submiterror').textContent = error.message;
    });
}
