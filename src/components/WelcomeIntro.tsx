import { useCallback, useEffect, useRef, useState } from 'react';

interface WelcomeIntroProps {
  onComplete: () => void;
}

export function WelcomeIntro({ onComplete }: WelcomeIntroProps) {
  const [leaving, setLeaving] = useState(false);
  const leavingRef = useRef(false);
  const exitTimer = useRef<number | undefined>(undefined);
  const removeTimer = useRef<number | undefined>(undefined);

  const dismiss = useCallback(() => {
    if (leavingRef.current) return;
    leavingRef.current = true;
    setLeaving(true);
    removeTimer.current = window.setTimeout(onComplete, 700);
  }, [onComplete]);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    exitTimer.current = window.setTimeout(dismiss, reducedMotion ? 1800 : 4900);
    return () => {
      window.clearTimeout(exitTimer.current);
      window.clearTimeout(removeTimer.current);
    };
  }, [dismiss]);

  return (
    <section
      className={`welcome-intro${leaving ? ' welcome-intro-leaving' : ''}`}
      aria-label="Welcome to BuildMyML"
      aria-live="polite"
    >
      <div className="welcome-blueprint" aria-hidden="true">
        <div className="welcome-blueprint-glow" />
        <svg className="welcome-blueprint-lines" viewBox="0 0 760 330" fill="none">
          <path className="welcome-trace welcome-trace-one" d="M92 166h115l42-46h100l40 40h112l38-39h129" />
          <path className="welcome-trace welcome-trace-two" d="M130 252h107l42-40h64m112 0h83l44 40h87" />
          <path className="welcome-trace welcome-trace-three" d="M183 77h100l42 42m225 2 38-42h83" />
          <path className="welcome-trace welcome-trace-four" d="M285 120v91m113-51v52m149-91v90" />
          <circle className="welcome-data-packet" r="4">
            <animateMotion
              dur="3.2s"
              begin="1.8s"
              repeatCount="indefinite"
              path="M92 166h115l42-46h100l40 40h112l38-39h129"
            />
          </circle>
          <circle className="welcome-trace-node" cx="92" cy="166" r="5" />
          <circle className="welcome-trace-node" cx="698" cy="121" r="5" />
          <circle className="welcome-trace-node" cx="130" cy="252" r="5" />
          <circle className="welcome-trace-node" cx="668" cy="252" r="5" />
          <rect className="welcome-module welcome-module-input" x="202" y="129" width="82" height="74" rx="13" />
          <rect className="welcome-module welcome-module-model" x="340" y="130" width="85" height="84" rx="15" />
          <rect className="welcome-module welcome-module-output" x="510" y="128" width="82" height="74" rx="13" />
          <circle className="welcome-network-node" cx="362" cy="157" r="5" />
          <circle className="welcome-network-node" cx="402" cy="157" r="5" />
          <circle className="welcome-network-node" cx="382" cy="184" r="5" />
          <path className="welcome-network-link" d="m362 157 20 27 20-27m-40 0h40" />
        </svg>
        <div className="welcome-label welcome-label-input">INPUT</div>
        <div className="welcome-label welcome-label-model">MODEL</div>
        <div className="welcome-label welcome-label-output">BLUEPRINT</div>
        <div className="welcome-blueprint-caption">SYSTEM ARCHITECTURE · REV 01</div>
      </div>

      <div className="welcome-copy">
        <span className="welcome-kicker"><span /> MACHINE LEARNING, MADE BUILDABLE</span>
        <h1>Welcome to <span>BuildMyML</span></h1>
        <p>Turn your idea into a blueprint for what comes next.</p>
        <div className="welcome-progress" aria-hidden="true"><span /></div>
      </div>

      <button className="welcome-skip" type="button" onClick={dismiss}>
        Skip intro <span aria-hidden="true">→</span>
      </button>
    </section>
  );
}
