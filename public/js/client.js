function loadLogInPage() {
    // Opens the register page when the register button is clicked
    document.getElementById('register-button').addEventListener('click', function() { location.href = '/register' });
    document.getElementById('login-button').addEventListener('click', function() { requestLogIn(); });
}

function loadRegisterPage() {
    document.getElementById('register-button').addEventListener('click', function() { postRegister(); });
}

function postRegister() {
    let username = document.getElementById('username-input').value;
    let password = document.getElementById('password-input').value;
    let firstname = document.getElementById('firstname-input').value;
    let lastname = document.getElementById('lastname-input').value;
    let dob = document.getElementById('dob-input').value;

    let dobRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|1[0-9]|2[1-9]|3[0-1])\/(\d{4})$/;

    // If the entered date of birth is valid, send the entered account information to the server to register this user
    if (dobRegex.test(dob)) {
        const [month, day, year] = dob.split('/');
        let accountInfo = {
            username: username,
            password: password,
            firstname: firstname,
            lastname: lastname,
            dob: new Date(year, month-1, day)
        };

        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                alert('Registration successful! Redirecting to log in page');
                location.href = '/';
            }
        }
        xhttp.open('POST', '/users/register');
        xhttp.setRequestHeader('Content-Type', 'application/json');
        xhttp.send(JSON.stringify(accountInfo));
    } 
    else {
        alert('Invalid date entered!');
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
            alert('Invalid credentials! Please try again.');
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

function loadAccountPage() {
    document.getElementById('switch-account-button').addEventListener('click', function() { switchAccount() });

    let submitButton = document.getElementById('submit-button');
    submitButton.addEventListener('click', function() { submitChanges() });
    submitButton.disabled = true;

    document.getElementById('username-input').addEventListener('input', function() { submitButton.disabled = false });
    document.getElementById('password-input').addEventListener('input', function() { submitButton.disabled = false });
    document.getElementById('firstname-input').addEventListener('input', function() { submitButton.disabled = false });
    document.getElementById('lastname-input').addEventListener('input', function() { submitButton.disabled = false });
    document.getElementById('dob-input').addEventListener('input', function() { submitButton.disabled = false });
}

function switchAccount() {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            alert('Account switch successful');
            location.reload();
        }
        else if (this.readyState == 4 && this.status == 401) {
            alert('You must post some artwork to become an artist!');
            location.href = '/gallery/add-artwork';
        }
        else if (this.readyState == 4 && this.status == 404) {
            alert('Error! User not found! Redirecting to log in page.');
            location.href = '/';
        }
    }
    xhttp.open('PUT', '/users/switchAccount');
    xhttp.send();
}

function submitChanges() {
    let username = document.getElementById('username-input').value;
    let password = document.getElementById('password-input').value;
    let firstname = document.getElementById('firstname-input').value;
    let lastname = document.getElementById('lastname-input').value;
    let dob = document.getElementById('dob-input').value;

    let dobRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|1[0-9]|2[1-9]|3[0-1])\/(\d{4})$/;

    // If the entered date of birth is valid, send the entered account information to the server to update the user
    if (dobRegex.test(dob)) {
        const [month, day, year] = dob.split('/');
        let accountInfo = {
            username: username,
            password: password,
            firstname: firstname,
            lastname: lastname,
            dob: new Date(year, month-1, day)
        };

        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                alert('Changes saved successfully');
                document.getElementById('dob-input').style.border = '1px solid black';
            }
            else if (this.readyState == 4 && this.status == 404) {
                alert('Error! User not found! Redirecting to log in page.');
                location.href = '/';
            }
        }
        xhttp.open('PUT', '/users/update');
        xhttp.setRequestHeader('Content-Type', 'application/json');
        xhttp.send(JSON.stringify(accountInfo));
    } 
    else {
        alert('Invalid date entered!');
        document.getElementById('dob-input').style.border = '1px solid red';
    }
}

function loadAddArtworkPage() {
    document.getElementById('submit-button').addEventListener('click', function() { addArtWork() });
}

function addArtWork() {
    if ( document.getElementById('title-input').value == '' || document.getElementById('year-input').value == '' ||
        document.getElementById('medium-input').value == '' || document.getElementById('description-input').value == '' ||
        document.getElementById('poster-input').value == '' ) {
            alert("Please fill in all fields!");
    }
    else {
        let title = document.getElementById('title-input').value;
        let year = parseInt(document.getElementById('year-input').value);
        let category = document.getElementById('category-input').value;
        let medium = document.getElementById('medium-input').value;
        let description = document.getElementById('description-input').value;
        let poster = document.getElementById('poster-input').value;

        let artworkInformation = {
            title: title,
            year: year,
            category: category,
            medium: medium,
            description: description,
            poster: poster
        }

        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                let xhttp1 = new XMLHttpRequest();
                xhttp1.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        alert('Art added successfully');
                        location.href = '/';
                    }
                }
                xhttp1.open('POST', '/gallery/post-artpiece');
                xhttp1.setRequestHeader('Content-Type', 'application/json');
                xhttp1.send(this.responseText);
            }
            else if (this.readyState == 4 && this.status == 404) {
                alert("User not found! Redirecting to log in page!");
                location.href = '/';
            }
        }
        xhttp.open('POST', '/users/post-artpiece');
        xhttp.setRequestHeader('Content-Type', 'application/json');
        xhttp.send(JSON.stringify(artworkInformation));
    }
}