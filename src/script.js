import Experience from "./Experience/Experience";
import gsap from 'gsap'

// canvas
const canvas = document.querySelector(`.webgl`)

// init experience
const experience = new Experience(canvas)

const tl = gsap.timeline()

// show canvas
const button = document.querySelector(`.button`)
button.addEventListener(`click`, ()=>
{
    tl
    .to(`.loading-screen`, {clipPath: `circle(0% at 50% 62%)`, duration: 2, ease: "power4.out"}, 0)
    .to(experience.camera.position, {x: 0, y: 1.2, z: 2, duration: 28, delay: 3}, 3)
    .then(experience.audio())

    tl.play()

    setTimeout(() => {experience.enableControls()}, 28000)

})
