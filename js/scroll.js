const wrokItemArea = document.querySelectorAll(".js-work-item");
const wrokItemAreaImg = document.querySelectorAll(".js-work-item .img");
const cbk = function (erement, observer) {
    erement.forEach(element => {
        if (element.isIntersecting) {
            element.target.classList.add("view")
            observer.unobserve(element.target)
        }
    });
}
const option = {
    rootMargin: "-100px 0px",
}
const work = new IntersectionObserver(cbk, option);
wrokItemArea.forEach(entry => { work.observe(entry) });