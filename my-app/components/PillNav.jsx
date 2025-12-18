import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';

const PillNav = ({
  logo,
  logoAlt = 'Logo',
  items,
  activeHref,
  className = '',
  ease = 'power3.easeOut',
  baseColor = '#fff',
  pillColor = '#060010',
  hoveredPillTextColor = '#060010',
  pillTextColor,
  navHeight = 42,
  logoSize = 36,
  pillGap = 3,
  pillPadX = 18,
  onMobileMenuClick,
  initialLoadAnimation = true
}) => {
  const resolvedPillTextColor = pillTextColor ?? baseColor;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const circleRefs = useRef([]);
  const tlRefs = useRef([]);
  const activeTweenRefs = useRef([]);
  const logoImgRef = useRef(null);
  const logoTweenRef = useRef(null);
  const hamburgerRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navItemsRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach(circle => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${Math.max(0, delta - 6)}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`
        });

        const label = pill.querySelector('.pill-label');
        const white = pill.querySelector('.pill-label-hover');

        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h * 0.75, opacity: 0 });

        const index = circleRefs.current.indexOf(circle);
        if (index === -1) return;

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 0.45, ease, overwrite: 'auto' }, 0);

        if (label) {
          tl.to(label, { y: -(h * 0.9), duration: 0.45, ease, overwrite: 'auto' }, 0);
        }
        if (white) {
          tl.to(white, { y: 0, opacity: 1, duration: 0.45, ease, overwrite: 'auto' }, 0);
        }

        tlRefs.current[index] = tl;
      });
    };

    layout();

    const onResize = () => layout();
    window.addEventListener('resize', onResize);

    if (document.fonts?.ready) {
      document.fonts.ready.then(layout).catch(() => {});
    }

    const menu = mobileMenuRef.current;
    if (menu) {
      gsap.set(menu, { visibility: 'hidden', opacity: 0, scaleY: 1, y: 0 });
    }

    if (initialLoadAnimation) {
      const logo = logoRef.current;
      const navItems = navItemsRef.current;

      if (logo) {
        gsap.set(logo, { scale: 0 });
        gsap.to(logo, {
          scale: 1,
          duration: 0.6,
          ease
        });
      }

      if (navItems) {
        gsap.set(navItems, { width: 0, overflow: 'hidden' });
        gsap.to(navItems, {
          width: 'auto',
          duration: 0.6,
          ease
        });
      }
    }

    return () => window.removeEventListener('resize', onResize);
  }, [items, ease, initialLoadAnimation]);

  const handleEnter = i => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease,
      overwrite: 'auto'
    });
  };

  const handleLeave = i => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, {
      duration: 0.2,
      ease,
      overwrite: 'auto'
    });
  };

  const handleLogoEnter = () => {
    const img = logoImgRef.current;
    if (!img) return;
    logoTweenRef.current?.kill();
    gsap.set(img, { rotate: 0 });
    logoTweenRef.current = gsap.to(img, {
      rotate: 360,
      duration: 0.2,
      ease,
      overwrite: 'auto'
    });
  };

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);

    const hamburger = hamburgerRef.current;
    const menu = mobileMenuRef.current;

    if (hamburger) {
      const lines = hamburger.querySelectorAll('.hamburger-line');
      if (newState) {
        gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease });
      } else {
        gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease });
      }
    }

    if (menu) {
      if (newState) {
        gsap.set(menu, { visibility: 'visible' });
        gsap.fromTo(
          menu,
          { opacity: 0, y: 10, scaleY: 1 },
          {
            opacity: 1,
            y: 0,
            scaleY: 1,
            duration: 0.3,
            ease,
            transformOrigin: 'top center'
          }
        );
      } else {
        gsap.to(menu, {
          opacity: 0,
          y: 10,
          scaleY: 1,
          duration: 0.2,
          ease,
          transformOrigin: 'top center',
          onComplete: () => {
            gsap.set(menu, { visibility: 'hidden' });
          }
        });
      }
    }

    onMobileMenuClick?.();
  };

  const isExternalLink = href =>
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('//') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('#');

  const isRouterLink = href => href && !isExternalLink(href);

  const cssVars = {
    ['--base']: baseColor,
    ['--pill-bg']: pillColor,
    ['--hover-text']: hoveredPillTextColor,
    ['--pill-text']: resolvedPillTextColor,
    ['--nav-h']: `${navHeight}px`,
    ['--logo']: `${logoSize}px`,
    ['--pill-pad-x']: `${pillPadX}px`,
    ['--pill-gap']: `${pillGap}px`
  };

  return (
    <div className="absolute top-[1em] z-[1000] w-full left-0 md:w-auto md:left-auto">
      <nav
        className={className}
        aria-label="Primary"
        style={{
          ...cssVars,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px 8px',
          borderRadius: 999,
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0.06))',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.22)',
          width: 'fit-content',
          boxShadow:
            '0 14px 40px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.25)',
          overflow: 'visible',
          margin: '0 auto',
          isolation: 'isolate'
        }}
      >
        <div
          ref={navItemsRef}
          style={{
            height: 'var(--nav-h)',
            display: 'flex',
            alignItems: 'center',
            background: 'transparent',
            overflow: 'visible',
          }}
        >
          <ul
            role="menubar"
            style={{
              listStyle: 'none',
              display: 'flex',
              alignItems: 'stretch',
              margin: 0,
              padding: 0,
              gap: 'var(--pill-gap)',
              height: '100%',
            }}
          >
            {items.map((item, i) => {
              const isActive = activeHref === item.href;

              const pillStyle = {
                background: 'var(--pill-fill, var(--pill-bg, #0b061a))',
                color: 'var(--pill-text, #f7f4ff)',
                border: 'none',
                paddingLeft: 'var(--pill-pad-x)',
                paddingRight: 'var(--pill-pad-x)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 999,
                position: 'relative',
                overflow: 'hidden',
                textDecoration: 'none',
                height: 'var(--nav-h)',
                fontFamily: "'League Spartan', sans-serif",
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontSize: '16px',
              };

              const PillContent = (
                <>
                  <span
                    className="hover-circle"
                    style={{
                      position: 'absolute',
                      left: '50%',
                      bottom: 0,
                      transform: 'translate(-50%, 40%)',
                      borderRadius: '999px',
                      background: 'var(--base, #b09bff)',
                      zIndex: 1,
                      pointerEvents: 'none'
                    }}
                    aria-hidden="true"
                    ref={el => {
                      circleRefs.current[i] = el;
                    }}
                  />
                  <span
                    className="label-stack"
                    style={{
                      position: 'relative',
                      display: 'inline-block',
                      lineHeight: 1,
                      zIndex: 2
                    }}
                  >
                    <span
                      className="pill-label"
                      style={{
                        position: 'relative',
                        display: 'inline-block',
                        lineHeight: 1,
                        zIndex: 2,
                        willChange: 'transform'
                      }}
                    >
                      {item.label}
                    </span>
                    <span
                      className="pill-label-hover"
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        display: 'inline-block',
                        color: 'var(--hover-text, #b09bff)',
                        willChange: 'transform, opacity',
                        zIndex: 3
                      }}
                      aria-hidden="true"
                    >
                      {item.label}
                    </span>
                  </span>
                </>
              );

              return (
                <li key={item.href} role="none" style={{ display: 'flex', height: '100%' }}>
                  {isRouterLink(item.href) ? (
                    <Link
                      role="menuitem"
                      href={item.href}
                      style={pillStyle}
                      aria-label={item.ariaLabel || item.label}
                      onMouseEnter={() => handleEnter(i)}
                      onMouseLeave={() => handleLeave(i)}
                    >
                      {PillContent}
                    </Link>
                  ) : (
                    <a
                      role="menuitem"
                      href={item.href}
                      style={pillStyle}
                      aria-label={item.ariaLabel || item.label}
                      onMouseEnter={() => handleEnter(i)}
                      onMouseLeave={() => handleLeave(i)}
                    >
                      {PillContent}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <button
          ref={hamburgerRef}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
          className="md:hidden rounded-full border-0 flex flex-col items-center justify-center gap-1 cursor-pointer p-0 relative"
          style={{
            width: 'var(--nav-h)',
            height: 'var(--nav-h)',
            background: 'var(--base, #000)',
            display: 'none'
          }}
        >
          <span
            className="hamburger-line w-4 h-0.5 rounded origin-center transition-all duration-[10ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]"
            style={{ background: 'var(--pill-bg, #fff)' }}
          />
          <span
            className="hamburger-line w-4 h-0.5 rounded origin-center transition-all duration-[10ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]"
            style={{ background: 'var(--pill-bg, #fff)' }}
          />
        </button>
      </nav>

      <div
        style={{
          position: 'absolute',
          top: '0.35em',
          right: '0.75em',
          padding: '6px 8px',
          borderRadius: 999,
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0.06))',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.22)',
          boxShadow:
            '0 14px 40px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.25)',
          isolation: 'isolate',
          pointerEvents: 'auto',
          zIndex: 1001
        }}
      >
        <a
          href="/Haris_Resume.pdf"
          download
          className="download-pill"
          style={{
            ...cssVars,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0px',
            paddingLeft: 'var(--pill-pad-x)',
            paddingRight: 'var(--pill-pad-x)',
            height: 'var(--nav-h)',
            borderRadius: 999,
            textDecoration: 'none',
            fontFamily: "'League Spartan', sans-serif",
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontSize: '16px',
            color: 'var(--pill-text, #f7f4ff)',
            background: 'var(--pill-fill, var(--pill-bg, #0b061a))',
            border: 'none',
            boxShadow: '0 10px 28px rgba(0,0,0,0.28)',
            position: 'relative',
            overflow: 'hidden',
            whiteSpace: 'nowrap'
          }}
          aria-label="Download CV"
          onMouseEnter={() => handleEnter(items.length)}
          onMouseLeave={() => handleLeave(items.length)}
        >
          <span
            className="hover-circle"
            style={{
              position: 'absolute',
              left: '50%',
              bottom: 0,
              transform: 'translate(-50%, 40%)',
              borderRadius: '999px',
              background: 'var(--base, #b09bff)',
              zIndex: 1,
              pointerEvents: 'none'
            }}
            aria-hidden="true"
            ref={el => {
              circleRefs.current[items.length] = el;
            }}
          />
          <span
            className="label-stack"
            style={{
              position: 'relative',
              display: 'inline-block',
              lineHeight: 1,
              zIndex: 2
            }}
          >
            <span
              className="pill-label"
              style={{
                position: 'relative',
                display: 'inline-block',
                lineHeight: 1,
                zIndex: 2,
                willChange: 'transform'
              }}
            >
              Download CV
            </span>
            <span
              className="pill-label-hover"
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                display: 'inline-block',
                color: 'var(--hover-text, #b09bff)',
                willChange: 'transform, opacity',
                zIndex: 3
              }}
              aria-hidden="true"
            >
              Download CV
            </span>
          </span>
        </a>
      </div>

      <div
        ref={mobileMenuRef}
        className="md:hidden absolute top-[3em] left-4 right-4 rounded-[27px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] z-[998] origin-top"
        style={{
          ...cssVars,
          background:
            'linear-gradient(145deg, rgba(255,255,255,0.14), rgba(255,255,255,0.05))',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}
      >
        <ul className="list-none m-0 p-[3px] flex flex-col gap-[3px]">
          {items.map(item => {
            const defaultStyle = {
              background: 'var(--pill-bg, #fff)',
              color: 'var(--pill-text, #fff)'
            };
            const hoverIn = e => {
              e.currentTarget.style.background = 'var(--base)';
              e.currentTarget.style.color = 'var(--hover-text, #fff)';
            };
            const hoverOut = e => {
              e.currentTarget.style.background = 'var(--pill-bg, #fff)';
              e.currentTarget.style.color = 'var(--pill-text, #fff)';
            };

            const linkClasses =
              'block py-3 px-4 text-[16px] font-medium rounded-[50px] transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)]';

            return (
              <li key={item.href}>
                {isRouterLink(item.href) ? (
                  <Link
                    href={item.href}
                    className={linkClasses}
                    style={defaultStyle}
                    onMouseEnter={hoverIn}
                    onMouseLeave={hoverOut}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    className={linkClasses}
                    style={defaultStyle}
                    onMouseEnter={hoverIn}
                    onMouseLeave={hoverOut}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default PillNav;
