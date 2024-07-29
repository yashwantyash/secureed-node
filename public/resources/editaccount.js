// public/resources/editaccount.js

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    if (email) {
        fetch(`/edit_account/${email}`)
            .then(response => response.json())
            .then(user => {
                if (user) {
                    document.getElementById("acctype").value = user.acctype;
                    document.getElementById("fname").value = user.fname;
                    document.getElementById("lname").value = user.lname;
                    document.getElementById("dob").value = user.dob;
                    document.getElementById("email").value = user.email;
                    document.getElementById("confirmemail").value = user.email;
                    document.getElementById("password").value = user.password;
                    document.getElementById("confirmpassword").value = user.password;
                    document.getElementById("squestion").value = user.squestion;
                    document.getElementById("sanswer").value = user.sanswer;
                    if (user.acctype === "3") {
                        document.getElementById("studentyear").value = user.studentyear;
                        document.getElementById("studentyear").style.display = "block";
                        document.getElementById("facultyrank").style.display = "none";
                    } else {
                        document.getElementById("facultyrank").value = user.facultyrank;
                        document.getElementById("facultyrank").style.display = "block";
                        document.getElementById("studentyear").style.display = "none";
                    }
                }
            });
    }

    document.getElementById('editaccform').addEventListener('submit', function(event) {
        event.preventDefault();

        const data = new FormData(this);
        const email = urlParams.get('email');
        fetch(`/edit_account/${email}`, {
            method: 'POST',
            body: data
        })
        .then(() => {
            window.location.href = '/usersearch';
        })
        .catch(error => console.error('Error:', error));
    });
});

function swapselection() {
    const acctype = document.getElementById("acctype").value;
    const studentyear = document.getElementById("studentyear");
    const facultyrank = document.getElementById("facultyrank");
    const positionlabel = document.getElementById("positionlabel");

    if (acctype === "3") { // Student
        facultyrank.style.display = "none";
        studentyear.style.display = "block";
        positionlabel.innerText = "Year:";
    } else { // Faculty
        studentyear.style.display = "none";
        facultyrank.style.display = "block";
        positionlabel.innerText = "Rank:";
    }
}
