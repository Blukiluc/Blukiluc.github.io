
function updateCountdown() {
    const concertDate = new Date('2027-05-08T20:00:00');
    const now = new Date();

    const diff = concertDate - now;

    const countdownElement = document.getElementById('countdown-days');

    if (diff <= 0) {
        countdownElement.innerText = "Today! ✨";
        return;
    }

    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));

    countdownElement.innerText = `J-${daysLeft}`;
}

updateCountdown();
