// Login Form Submit
document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Simple client-side validation
    if (username.trim() === '' || password.trim() === '') {
        alert('Lütfen kullanıcı adını ve şifreyi girin.');
        return;
    }

    // Request payload
    const loginData = {
        username: username,
        password: password
    };

    // Fetch request to /api/login/
    fetch('/api/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
    })
    .then(response => {
        if (response.ok) {
            return response.json(); // Parse JSON response
        } else {
            throw new Error('Giriş başarısız oldu.');
        }
    })
    .then(data => {
        if (data.access) {
            // Save the token to localStorage
            localStorage.setItem('accessToken', data.access);
    
            // Giriş başarılı mesajı
            alert('Giriş başarılı!');
    
            // Sayfayı yeniden yükle
            location.reload();
        } else {
            alert('Kullanıcı adı veya şifre hatalı.');
        }
    })
    .catch(error => {
        console.error('Hata:', error);
        alert('Giriş sırasında bir hata oluştu.');
    });
});
