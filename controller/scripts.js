$(document).ready(function () {
    $('.show-pw-image').on('touchstart mousedown', function () {
        $(this).prev().attr('type', 'text');
    }).mouseup(function () {
        $(this).prev().attr('type', 'password')
    }).mouseout(function () {
        $(this).prev().attr('type', 'password')
    });

    $('.show-pw-image-signup').on('touchstart mousedown', function () {
        $(this).prev().attr('type', 'text');
    }).mouseup(function () {
        $(this).prev().attr('type', 'password')
    }).mouseout(function () {
        $(this).prev().attr('type', 'password')
    });

    $('#login-container').addClass('slidein-from-right');
    $('#signup-container').addClass('slidein-from-left');

    $('#signup-form').submit(function (event) {
        if ($('#signup_email').val() == '') {
            event.preventDefault();

            Swal.fire({
                title: 'Email field is empty!',
                icon: 'error',
                confirmButtonColor: '#12BBF4',
                confirmButtonText: 'OK'
            });
        } else if ($('#signup_username').val() == '') {
            event.preventDefault();

            Swal.fire({
                title: 'Username field is empty!',
                icon: 'error',
                confirmButtonColor: '#12BBF4',
                confirmButtonText: 'OK'
            });
        } else if ($('#signup_password').val() == '') {
            event.preventDefault();

            Swal.fire({
                title: 'Password field is empty!',
                icon: 'error',
                confirmButtonColor: '#12BBF4',
                confirmButtonText: 'OK'
            });
        }
    });

    $('#login-form').submit(function (event) {
        if ($('#login-username').val() == '') {
            event.preventDefault();

            Swal.fire({
                title: 'Username field is empty!',
                icon: 'error',
                confirmButtonColor: '#12BBF4',
                confirmButtonText: 'OK'
            });
        } else if ($('#login-password').val() == '') {
            event.preventDefault();

            Swal.fire({
                title: 'Password field is empty!',
                icon: 'error',
                confirmButtonColor: '#12BBF4',
                confirmButtonText: 'OK'
            });
        }
    });
});