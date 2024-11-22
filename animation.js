
// const timeline = gsap.timeline();
// // Zoom out and fade in
// timeline.fromTo(
//     ".loadingtext",
//     {
//         scale: 2, 
//         opacity: 0,
//     },
//     {
//         scale: 1, 
//         opacity: 1, 
//         duration: 2.0, 
//         ease: "power4",
//     }
// );

var timelineFadeIn = gsap.timeline({delay: -0.5});

timelineFadeIn.set(".loadingtext", {opacity: 0, scale:2})
timelineFadeIn.to(".loadingtext", {
  keyframes: [
    { opacity: 0, duration: 10},
    { opacity: 0, scale:1, duration: 2},
  ],
  ease: "expo.out"
});


// gsap.to(".loadingtext", {
//     opacity: 0,
//     duration: 0.1,
//     delay: 0.5,
// });


gsap.fromTo(".hero-img", {
    height: "0%",
},
{
    height: "100%",
    duration: 0.6,
    delay: 0.4,
    ease: "power",
});

gsap.fromTo(".herotext", {
    width: "10%",
},
{
    width: "40%",
    duration: 1.2,
    ease: "slow",
    delay: 0.5,
});