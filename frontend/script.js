document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('bar');
    const closeBtn = document.getElementById('close');
    const navbar = document.querySelector('.navbar');

    menuBtn.addEventListener('click', () => {
        navbar.classList.add('active');
    });

    closeBtn.addEventListener('click', () => {
        navbar.classList.remove('active');
    });
});


// Form submission
document.getElementById('contact-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.target;
    const feedbackDiv = document.getElementById('form-feedback');
    const nameInput = form.querySelector('input[name="name"]').value.trim();
    const emailInput = form.querySelector('input[name="email"]').value.trim();
    const messageInput = form.querySelector('textarea[name="message"]').value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Client-side validation
    if (nameInput === '') {
        feedbackDiv.style.display = 'block';
        feedbackDiv.style.color = 'red';
        feedbackDiv.textContent = 'Please enter your name.';
        return;
    }
    if (!emailPattern.test(emailInput)) {
        feedbackDiv.style.display = 'block';
        feedbackDiv.style.color = 'red';
        feedbackDiv.textContent = 'Please enter a valid email address.';
        return;
    }
    if (messageInput === '') {
        feedbackDiv.style.display = 'block';
        feedbackDiv.style.color = 'red';
        feedbackDiv.textContent = 'Please enter your message.';
        return;
    }

    feedbackDiv.style.display = 'none';
    feedbackDiv.textContent = '';

    try {
        const response = await fetch('http://localhost:4000/send', {
            method: 'POST',
            body: new FormData(form),
        });

        console.log('Response status:', response.status);
        const text = await response.text();
        console.log('Raw response:', text);

        let result;
        try {
            result = JSON.parse(text);
        } catch (e) {
       console.error('JSON parse error:', e);
            throw new Error(`Server error: ${text}`);
        }

        if (response.ok) {
            feedbackDiv.style.display = 'block';
            feedbackDiv.style.color = 'green';
            feedbackDiv.textContent = result.message || 'Message sent successfully!';
            form.reset();
        } else {
            throw new Error(`${result.message || 'Failed to send message'}${result.code ? ` (${result.code})` : ''}`);
        }
    } catch (error) {
        feedbackDiv.style.display = 'block';
        feedbackDiv.style.color = 'red';
        feedbackDiv.textContent = error.message || 'An error occurred. Please try again.';
        console.error('Form submission error:', error);
    }
});
