function swapselection() {
    var studentselect = document.getElementById("studentyear");
    var facultyselect = document.getElementById("facultyrank");
    var acctype = document.getElementById("acctype");
    var positionlabel = document.getElementById("positionlabel");

    if (acctype.options[acctype.selectedIndex].text === "Faculty") {
        studentselect.style.display = "none";
        facultyselect.style.display = "inline";
        positionlabel.innerText = "Rank:";
    } else {
        studentselect.style.display = "inline";
        facultyselect.style.display = "none";
        positionlabel.innerText = "Year:";
    }
}

function submitAccount(event) {
    event.preventDefault();

    var pass = document.getElementById("password");
    var confirmpass = document.getElementById("confirmpassword");
    var email = document.getElementById("email");
    var confirmemail = document.getElementById("confirmemail");
    var submiterror = document.getElementById("submiterror");
    var accform = document.getElementById("accform");
    var cansubmit = true;

    try {
        while (submiterror.removeChild(submiterror.childNodes[0]) !== null) {}
    } catch {}

    submiterror.innerText = "";
    submiterror.style.display = "none";

    if (pass.value === "") {
        cansubmit = false;
        submiterror.innerText = "Password is empty. \n";
        submiterror.style.display = "block";
    }
    if (pass.value !== confirmpass.value) {
        cansubmit = false;
        submiterror.innerText = submiterror.innerText.concat("Password and Confirm Password are not the same. \n");
        submiterror.style.display = "block";
    }
    if (email.value === "") {
        cansubmit = false;
        submiterror.innerText = submiterror.innerText.concat("Email is empty. \n");
        submiterror.style.display = "block";
    }
    if (email.value !== confirmemail.value) {
        cansubmit = false;
        submiterror.innerText = submiterror.innerText.concat("Email and Confirm Email are not the same. \n");
        submiterror.style.display = "block";
    }
    if (cansubmit) {
        accform.submit();
    }
}
