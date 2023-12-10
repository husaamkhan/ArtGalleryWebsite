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

    // Turns the entered account information into JSON data to send to the server
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
        else if(this.readyState == 4 && this.status == 400) {
            alert('Username taken. Please choose a different username!');
        }
        else if (this.readyState == 4 & this.status == 500) {
            alert('Internal server error. Registration unsuccessful!');
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

    // The submit button is disabled until the user makes changes to their information
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
            location.reload(); // Reload the page so that it contains the updated information
        }
        // 401 status indicates that the user is not able to switch accounts yet, so redirect them to add artwork page so that they can add art in order to
        // become an artist
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

    // Convert the account info to JSON to send to the server
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
    document.getElementById('submit-button').addEventListener('click', function() { validateArtpiece() });
}

function validateArtpiece() {
    // Alert the user if they leave any fields empty
    if ( document.getElementById('title-input').value == '' || document.getElementById('year-input').value == '' ||
        document.getElementById('medium-input').value == '' || document.getElementById('poster-input').value == '' ) {
            alert("Please fill in all fields!");
    }
    else {
        // check if gallery already contains an artpiece with this title
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                addArtWork(); // If not, add the artpice
            }
            else if (this.readyState == 4 && this.status == 400) {
                alert('This title has already been taken');
            }
        }
        xhttp.open('GET', `/gallery/validate-art/${document.getElementById('title-input').value}`) // Send the title in the url
        xhttp.send();
    }
}

function addArtWork() {
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
                    location.href = '/user/dashboard';
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

function loadArtpiecePage() {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText);
            let userInfo = JSON.parse(this.responseText);

            // Doesnt add the like and review buttons if the user is the one that posted this art
            if (!userInfo.artwork.includes(document.getElementById('title-header').textContent)) {
                const likeButton = document.createElement("button");
                const reviewButton = document.createElement("button");

                if (userInfo.likes.includes(document.getElementById('title-header').textContent)) {
                    likeButton.textContent = 'Unlike';
                }
                else {
                    likeButton.textContent = 'Like';
                }

                if (userInfo.reviews.includes(document.getElementById('title-header').textContent)) {
                    reviewButton.textContent = "Remove review"
                }
                else {
                    reviewButton.textContent = 'Add review';
                }

                reviewButton.addEventListener('click', function() { review(userInfo)} );
                likeButton.addEventListener('click', function() { like(likeButton.textContent.toLowerCase()) });

                document.getElementById('artpiece-container').appendChild(likeButton);
                document.getElementById('artpiece-container').appendChild(reviewButton);
            }
        }
        else if (this.readyState == 4 && this.status == 404) {
            alert("User not found! Redirecting to log in!");
            location.href = '/';
        }
    }
    xhttp.open('GET', '/user/get-user-info');
    xhttp.send();
}

function review(userInfo) {
    if (userInfo.reviews.includes(document.getElementById('title-header').textContent)) {
        removeReview();
    }
    else {
        // Puts the artpiece title in url query to be retrieved later
        location.href = `/user/add-review?title=${document.getElementById('title-header').textContent}`;
    }
}

function like(operation) {
    let xhttpGallery = new XMLHttpRequest();
    xhttpGallery.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 404) {
            alert("Artpiece not found!");
        }
        else if (this.readyState == 4 && this.status == 200) {

            let xhttpUser = new XMLHttpRequest();
            xhttpUser.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    location.reload();
                }
               else if (this.readyState == 4 && this.status == 404) {
                    alert("User not found! Redirecting to home page!");
                    location.href = '/';
                }
            }
            xhttpUser.open('POST', `/user/${operation}/${document.getElementById('title-header').textContent}`);
            xhttpUser.send();

        }
    }
    console.log(document.getElementById('title-header').textContent);
    xhttpGallery.open('POST', `/gallery/${operation}/${document.getElementById('title-header').textContent}`);
    xhttpGallery.send();    
}

function loadAddReviewPage() {
    document.getElementById('submit-button').addEventListener('click', function() { addReview() });
}

function addReview() {
    if (document.getElementById('review-input').value == '') {
        alert('Please enter your review');
    }
    else {
        // Get title from the url and split it up then join the words to remove unwanted characters
        let title = location.href.split('?')[1];
        title = title.split('=')[1];
        title = title.split('%20').join(' ');

        let xhttpUser = new XMLHttpRequest();
        xhttpUser.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                let review = document.getElementById('review-input').value;

                let xhttpGallery = new XMLHttpRequest();
                xhttpGallery.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        location.href = `/gallery/view-art/${title}`;
                    }
                }
                xhttpGallery.open('POST', `/gallery/post-review/${title}`);
                xhttpGallery.setRequestHeader('Content-Type', 'application/json');
                xhttpGallery.send(JSON.stringify({ review: review }));
            }
        }
        xhttpUser.open('POST', `/user/post-review/${title}`) // gets the title from url query and posts review for that artpiece
        xhttpUser.send();
    }
}

function removeReview() {
    // Get title from the url and split it up then join the words to remove unwanted characters
    let title = document.getElementById('title-header').textContent;

    let xhttpUser = new XMLHttpRequest();
    xhttpUser.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let xhttpGallery = new XMLHttpRequest();
            xhttpGallery.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    // location.href = `/gallery/view-art/${title}`;
                    location.reload();
                }
            }
            xhttpGallery.open('DELETE', `/gallery/delete-review/${title}`)
            xhttpGallery.send();
        }
        else if (this.readyState == 4 && this.status == 404) {
            alert('404');
        }
        else if (this.readyState == 4 && this.status == 500) {
            alert('500');
        }
    }
    xhttpUser.open('DELETE', `/user/delete-review/${title}`);
    xhttpUser.send();
}