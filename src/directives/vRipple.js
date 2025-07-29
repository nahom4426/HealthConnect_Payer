function ripple(ev) {
  try {
    // Find the ripple target element
    const btn = ev.target.classList.contains('__ripple') 
      ? ev.target 
      : ev.target.closest('.__ripple');
    
    // If no button found, exit early
    if (!btn) return;

    // Find or create ripple child element
    let rippleChild = btn.querySelector('.__ripple_child');
    if (!rippleChild) {
      rippleChild = document.createElement('div');
      rippleChild.classList.add('__ripple_child');
      btn.appendChild(rippleChild);
    }

    // Calculate position - use clientX/Y for better accuracy
    const rect = btn.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const width = btn.clientWidth;

    // Only proceed if we have valid values
    if (rippleChild && !isNaN(x) && !isNaN(y) && width > 0) {
      rippleChild.style.setProperty("--x", `${x}px`);
      rippleChild.style.setProperty("--y", `${y}px`);
      rippleChild.style.setProperty("--btnWidth", `${width}px`);
      rippleChild.classList.add("__ripple_animation");

      setTimeout(() => {
        rippleChild?.classList.remove("__ripple_animation");
      }, 500);
    }
  } catch (error) {
    console.error('Ripple effect error:', error);
  }
}

export default {
  mounted: (el, { value }) => {
    try {
      // Set custom color if provided
      if (value) {
        el.style.setProperty("--ripple-clr", value);
      }

      // Add ripple classes and setup
      el.classList.add('__ripple');
      
      // Create ripple child element
      const div = document.createElement('div');
      div.classList.add('__ripple_child');
      el.appendChild(div);

      // Add event listener
      el.addEventListener("click", ripple, { passive: true });
    } catch (error) {
      console.error('Ripple directive mount error:', error);
    }
  },
  unmounted: (el) => {
    try {
      // Cleanup
      el.removeEventListener("click", ripple);
      const rippleChild = el.querySelector('.__ripple_child');
      if (rippleChild) {
        el.removeChild(rippleChild);
      }
    } catch (error) {
      console.error('Ripple directive unmount error:', error);
    }
  }
}