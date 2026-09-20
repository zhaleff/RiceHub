import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faXmark,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import logo from "../assets/ricehub.png";
import clsx from "clsx";

const navLinks = [
  { label: "Gallery", to: "/gallery" },
  { label: "About", to: "/about" },
];

const EMPHASIZED = [0.05, 0.7, 0.1, 1];
const STANDARD = [0.2, 0, 0, 1];
const ISLAND = "h-14 rounded-full bg-surface-2 border border-border";

function CtaButton({ className }) {
  return (
    <Link
      to="/submit"
      className={clsx(
        "group flex items-center gap-2 px-6 font-semibold text-surface bg-white bg-hover:bg-accent-dim transition-colors duration-200 cursor-pointer",
        ISLAND,
        className,
      )}
    >
      Share your build
      <FontAwesomeIcon
        icon={faArrowRight}
        className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
      />
    </Link>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 px-6 pt-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto gap-3">
          <Link
            to="/"
            className={clsx(
              "flex items-center gap-3 px-6 flex-shrink-0",
              ISLAND,
            )}
          >
            <img src={logo} alt="RiceHub logo" className="h-8 mb-2 w-auto" />
          </Link>

          <nav
            className={clsx("hidden md:flex items-center gap-1 px-2", ISLAND)}
          >
            {navLinks.map(({ label, to }) => (
              <NavLink
                key={label}
                to={to}
                className="relative px-5 h-11 flex items-center text-base font-medium rounded-full transition-colors duration-200 cursor-pointer"
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full bg-surface-3 border border-border"
                        transition={{
                          type: "spring",
                          stiffness: 420,
                          damping: 34,
                        }}
                      />
                    )}
                    <span
                      className={clsx(
                        "relative z-10 transition-colors duration-200",
                        isActive
                          ? "text-accent"
                          : "text-text-dim hover:text-text",
                      )}
                    >
                      {label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <CtaButton className="hidden md:flex text-base" />

          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className={clsx(
              "md:hidden flex items-center justify-center w-14 text-text-dim hover:text-text transition-colors duration-200 cursor-pointer",
              ISLAND,
            )}
          >
            <FontAwesomeIcon
              icon={mobileOpen ? faXmark : faBars}
              className="w-5 h-5"
            />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-surface/70 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.28, ease: EMPHASIZED }}
            className="fixed top-28 left-6 right-6 z-50 rounded-3xl md:hidden overflow-hidden bg-surface-2 border border-border"
          >
            <nav className="p-4 flex flex-col gap-2">
              {navLinks.map(({ label, to }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.05 + i * 0.04,
                    duration: 0.25,
                    ease: STANDARD,
                  }}
                >
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      clsx(
                        "flex items-center px-6 py-4 rounded-2xl text-lg font-semibold transition-colors duration-200 cursor-pointer",
                        isActive
                          ? "bg-surface-3 border border-border text-accent"
                          : "text-text-dim hover:text-text hover:bg-white/[0.03]",
                      )
                    }
                  >
                    {label}
                  </NavLink>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.05 + navLinks.length * 0.04,
                  duration: 0.25,
                }}
                className="mt-2 pt-4 border-t border-border"
              >
                <CtaButton className="justify-center w-full text-lg active:scale-[0.98] transition-transform" />
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
