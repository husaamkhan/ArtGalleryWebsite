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

    let accountInfo = {
        username: username,
        password: password,
        firstname: firstname,
        lastname: lastname,
    };

    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            alert('Registration successful! Redirecting to log in page');
            location.href = '/';
        }
    }
    xhttp.open('POST', '/user/register');
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(accountInfo));
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
            location.href = '/user/dashboard';
        }
    }
    xhttp.open('POST', '/user/logIn');
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
    xhttp.open('PUT', '/user/switchAccount');
    xhttp.send();
}

function submitChanges() {
    let username = document.getElementById('username-input').value;
    let password = document.getElementById('password-input').value;
    let firstname = document.getElementById('firstname-input').value;
    let lastname = document.getElementById('lastname-input').value;

    let accountInfo = {
        username: username,
        password: password,
        firstname: firstname,
        lastname: lastname,
    };

    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            alert('Changes saved successfully');
        }
        else if (this.readyState == 4 && this.status == 404) {
            alert('Error! User not found! Redirecting to log in page.');
            location.href = '/';
        }
    }
    xhttp.open('PUT', '/user/update');
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(accountInfo));
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
        xhttp.open('POST', '/user/post-artpiece');
        xhttp.setRequestHeader('Content-Type', 'application/json');
        xhttp.send(JSON.stringify(artworkInformation));
    }
}

function loadDashboard() {
    let ul = document.getElementById('artwork-list');

    if(ul) {
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                let artpieceIds = JSON.parse(this.responseText);
                let queryString = artpieceIds.join(',')
                let xhttp1 = new XMLHttpRequest();
                xhttp1.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        const artpieceList = JSON.parse(this.responseText);
                        console.log(artpieceList)

                        for (let i = 0; i < artpieceList.length; i++) {
                            const li = document.createElement('li');
        
                            const a = document.createElement('a');
                            a.href = `/gallery/view-art/${artpieceIds[i]}`;
                            a.textContent = artpieceList[i].title;

                            li.appendChild(a)
                            ul.appendChild(li);
                        }
                    }
                }
                xhttp1.open('GET', `/gallery/get-artpieces?ids=${queryString}`);
                xhttp1.setRequestHeader('Content-Type', 'application/json');
                xhttp1.send();

                
            }
            else if (this.readyState == 4 && this.status == 404) {
                alert("User not found! Redirecting to log in page");
                location.href = '/';
            }
        }
        xhttp.open('GET', '/user/artwork');
        xhttp.send();
    }
}