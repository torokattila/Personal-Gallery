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
});