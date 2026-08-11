import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createCampaignStep1,
  createCampaignStep2,
  createCampaignStep3,
  createCampaignStep4,
  createCampaignStep5,
} from '../data/capturedHtml.js';

const STEPS = [
  createCampaignStep1, // intro — "Get Started"
  createCampaignStep2, // setup type — "Review Your Gift"
  createCampaignStep3, // products / gift card — "Create My Campaign"
  createCampaignStep4, // brief review — "Next: Find Creators"
  createCampaignStep5, // creator matching — "Launch Campaign"
];

export default function CreateCampaignPage() {
  const [step, setStep] = useState(0);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const onClick = (e) => {
      const btn = e.target.closest('button, a');
      if (!btn) return;
      const txt = btn.textContent.trim();

      // ---- Forward navigation ----
      if (txt === 'Get Started') {
        e.preventDefault();
        setStep(1);
      } else if (txt === 'Review Your Gift' || txt === 'Choose Gift Card Amount') {
        e.preventDefault();
        setStep(2);
      } else if (txt === 'Create My Campaign') {
        e.preventDefault();
        setStep(3);
      } else if (txt === 'Next: Find Creators') {
        e.preventDefault();
        setStep(4);
      } else if (txt === 'Launch Campaign') {
        e.preventDefault();
        // Drop them on the existing demo campaign detail page.
        navigate('/brand/tonypikora/campaigns/0');
      }
      // ---- Back navigation ----
      else if (txt === 'Back') {
        e.preventDefault();
        if (step === 0) navigate('/brand/tonypikora/campaigns');
        else setStep((s) => Math.max(s - 1, 0));
      } else if (txt === 'Back to Campaigns') {
        e.preventDefault();
        navigate('/brand/tonypikora/campaigns');
      } else if (txt === 'Back to Gift Card') {
        e.preventDefault();
        setStep(2);
      } else if (txt === 'Back to Campaign Brief') {
        e.preventDefault();
        setStep(3);
      }
      // ---- Inert in the prototype ----
      else if (txt === 'Edit' || btn.classList.contains('draft-card-edit')) {
        // Edit-section buttons in the brief review — no dedicated edit flow
        // captured yet, so swallow the click rather than letting the link fire.
        e.preventDefault();
      } else if (txt === 'Saved' || btn.disabled) {
        e.preventDefault();
      }
    };
    root.addEventListener('click', onClick);
    return () => root.removeEventListener('click', onClick);
  }, [navigate, step]);

  return <div ref={ref} dangerouslySetInnerHTML={{ __html: STEPS[step] }} />;
}
