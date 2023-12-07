function loadLogInPage() {
    // Opens the register page when the register button is clicked
    document.getElementById('registerButton').addEventListener('click', function() { location.href = '/register' });
    document.getElementById('logInButton').addEventListener('click', function() { requestLogIn(); });
}

function loadRegisterPage() {
    document.getElementById('registerButton').addEventListener('click', function() { postRegister(); });
}

function postRegister() {
    let username = document.getElementById('username-input').value;
    let password = document.getElementById('password-input').value;
    let firstname = document.getElementById('firstname-input').value;
    let lastname = document.getElementById('lastname-input').value;
    let dob = document.getElementById('dob-input').value;

    console.log('username: ' + username);
    console.log('password: ' + password);
    console.log('firstname: ' + firstname);
    console.log('lastname: ' + lastname);
    console.log('dob: ' + dob);

    let dobRegex = /^(\d{4})-(0[1-9]||1[0-2])-(0[1-9]||1[0-9]||2[0-9]||3[0-1])$/

    // If the entered date of birth is valid, send the entered account information to the server to register this user
    if (dobRegex.test(dob)) {
        let accountInfo = {
            username: username,
            password: password,
            name: `${firstname} ${lastname}`,
            dob: new Date(dob)
        };

        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                location.href = '/';
            }
        }
        xhttp.open('POST', '/users/register');
        xhttp.setRequestHeader('Content-Type', 'application/json');
        xhttp.send(JSON.stringify(accountInfo));
    } 
    else {
        alert("Invalid date entered!");
        document.getElementById('dob-input').style.border = '1px solid red'
    }
}

function requestLogIn() {
    let username = document.getElementById('username-input').value;
    let password = document.getElementById('password-input').value;

    let credentials = {
        username: username,
        password: password
    };

    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 404) {
            alert("Invalid credentials! Please try again.");
            document.getElementById('username-input').style.border = '1px solid red';
            document.getElementById('password-input').style.border = '1px solid red';
        }

        if (this.readyState == 4 && this.status == 200) {
            location.href = '/users/dashboard';
        }
    }
    xhttp.open('POST', '/users/logIn');
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(credentials));
}