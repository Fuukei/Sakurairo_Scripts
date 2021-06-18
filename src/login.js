/*
 *	Resize Image
*/
function resizeImage(id) {
	let a = document.getElementById(id);
	a.style.position = "absolute";
	a.style.top = "0px";
	a.style.left = "0px";
	a.style.width = "100%";
	a.style.height = "100%";
	a.style.zIndex = "-1";
	a.style.overflow = "hidden";
	let w = document.documentElement.clientWidth ||document.body.clientWidth,
		h = document.documentElement.clientHeight ||document.body.clientHeight,
		o = document.querySelector("#" + id + " img"),
		iW = parseFloat(getComputedStyle(o, null).width.replace("px", "")),
		iH = parseFloat(getComputedStyle(o, null).height.replace("px", ""));
	o.style.display = "block";
	o.style.opacity = "0";
	if (w > h) {
		if (iW > iH) {
			o.style.width = w + "px";
			o.style.height = Math.round((iH / iW) * w) + "px";
			let newIh = Math.round((iH / iW) * w);
			if (newIh < h) {
				o.style.height = h + "px";
				o.style.width = Math.round((iW / iH) * h) + "px";
			}
		} else {
			o.style.height = h + "px";
			o.style.width = Math.round((iW / iH) * h) + "px";
		}
	} else {
		o.style.height = h + "px";
		o.style.width = Math.round((iW / iH) * h) + "px";
	}
	let newIW = parseFloat(getComputedStyle(o, null).width.replace("px", "")),
		newIH = parseFloat(getComputedStyle(o, null).height.replace("px", ""));
	if (newIW > w) {
		let l = (newIW - w) / 2;
		o.style.marginLeft = -l;
	} else {
		o.style.marginLeft = 0;
	}
	if (newIH > h) {
		let t = (newIH - h) / 2;
		o.style.marginTop = -t;
	} else {
		o.style.marginTop = 0;
	}
	o.style.opacity = "1";
}
window.resizeImage = resizeImage;