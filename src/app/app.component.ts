import { Component, OnDestroy, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from './firebase.service';
import { WEDDING } from './wedding.config';
import confetti from 'canvas-confetti';

type Language = 'en' | 'ml';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  readonly wedding = WEDDING;
  language: Language = 'en';
  invitationOpened = false;
  isOpening = false;
  letterOpened = false;
  musicPlaying = false;
  mobileMenuOpen = false;
  countdown = { days: '00', hours: '00', minutes: '00', seconds: '00' };
  private timer?: ReturnType<typeof setInterval>;
  private audio?: HTMLAudioElement;

  @ViewChild('scratchCanvas') scratchCanvasRef?: ElementRef<HTMLCanvasElement>;
  scratchRevealed = false;
  scratchStarted = false;
  private scratchCtx?: CanvasRenderingContext2D | null;
  private isScratching = false;

  rsvp = { name: '', phone: '', guests: 1, attending: 'yes' };
  dua = { name: '', message: '' };
  feedback = { type: 'Message', message: '' };
  rsvpStatus = '';
  rsvpStatusType: 'success' | 'error' = 'success';
  duaStatus = '';
  duaStatusType: 'success' | 'error' = 'success';
  feedbackStatus = '';
  feedbackStatusType: 'success' | 'error' = 'success';
  submitting = false;

  constructor(private firebase: FirebaseService) { }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    if (!this.invitationOpened) {
      document.body.style.overflow = 'hidden';
    }
    this.updateCountdown();
    this.timer = setInterval(() => this.updateCountdown(), 1000);
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initScratchCanvas(), 400);
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
    if (this.timer) clearInterval(this.timer);
    this.audio?.pause();
  }

  get ml(): boolean { return this.language === 'ml'; }

  toggleLanguage(language: Language): void {
    this.language = language;
    if (!this.scratchStarted && !this.scratchRevealed) {
      this.paintScratchSurface(360, 330);
    }
  }

  initScratchCanvas(): void {
    if (this.scratchRevealed) return;
    const canvas = this.scratchCanvasRef?.nativeElement || (document.getElementById('scratchCanvas') as HTMLCanvasElement);
    if (!canvas) return;

    const W = 360;
    const H = 330;
    canvas.width = W;
    canvas.height = H;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    this.scratchCtx = ctx;

    if (!this.scratchStarted) {
      this.paintScratchSurface(W, H);
    }

    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      const scaleX = W / rect.width;
      const scaleY = H / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    };

    const scratch = (e: MouseEvent | TouchEvent) => {
      if (!this.isScratching || this.scratchRevealed) return;
      const pos = getPos(e);

      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 36, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (!this.scratchStarted) {
        this.scratchStarted = true;
      }

      this.checkScratchPercentage(W, H);
    };

    canvas.onmousedown = (e) => { this.isScratching = true; scratch(e); };
    canvas.onmousemove = (e) => { scratch(e); };
    canvas.onmouseup = () => { this.isScratching = false; };
    canvas.onmouseleave = () => { this.isScratching = false; };

    canvas.ontouchstart = (e) => {
      e.preventDefault();
      this.isScratching = true;
      scratch(e);
    };
    canvas.ontouchmove = (e) => {
      e.preventDefault();
      scratch(e);
    };
    canvas.ontouchend = () => { this.isScratching = false; };
    canvas.ontouchcancel = () => { this.isScratching = false; };
  }

  paintScratchSurface(W: number, H: number): void {
    if (!this.scratchCtx) return;
    const ctx = this.scratchCtx;
    ctx.clearRect(0, 0, W, H);

    // Solid rich metallic gold gradient matching Screenshot 2
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#f5deb3');
    bg.addColorStop(0.2, '#d4af37');
    bg.addColorStop(0.55, '#c99e28');
    bg.addColorStop(0.8, '#b88a1a');
    bg.addColorStop(1, '#9b710f');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Diagonal highlight shine
    const shine = ctx.createLinearGradient(W * 0.1, 0, W * 0.7, H * 0.7);
    shine.addColorStop(0, 'rgba(255, 255, 255, 0)');
    shine.addColorStop(0.4, 'rgba(255, 255, 245, 0.28)');
    shine.addColorStop(0.55, 'rgba(255, 255, 245, 0.12)');
    shine.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = shine;
    ctx.fillRect(0, 0, W, H);

    // Label on gold surface
    ctx.fillStyle = 'rgba(56, 32, 6, 0.9)';
    ctx.font = '600 12px "Cinzel", "Cormorant Garamond", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.ml ? '✦  വെളിപ്പെടുത്താൻ സ്ക്രാച്ച് ചെയ്യുക  ✦' : '✦  SCRATCH TO REVEAL  ✦', W / 2, H * 0.42);

    // Heart ♡ icon
    ctx.font = '28px serif';
    ctx.fillStyle = 'rgba(56, 32, 6, 0.55)';
    ctx.fillText('♡', W / 2, H * 0.54);
  }

  private checkScratchPercentage(W: number, H: number): void {
    if (this.scratchRevealed || !this.scratchCtx) return;
    try {
      const data = this.scratchCtx.getImageData(0, 0, W, H).data;
      let total = 0;
      let transparent = 0;
      for (let i = 3; i < data.length; i += 16) {
        total++;
        if (data[i] < 128) transparent++;
      }
      if (transparent / total > 0.35) {
        this.revealScratch();
      }
    } catch {
      // Ignore security errors if any
    }
  }

  revealScratch(): void {
    if (this.scratchRevealed) return;
    this.scratchRevealed = true;
    this.scratchStarted = true;

    const canvas = this.scratchCanvasRef?.nativeElement || (document.getElementById('scratchCanvas') as HTMLCanvasElement);
    if (canvas && this.scratchCtx) {
      setTimeout(() => {
        this.scratchCtx?.clearRect(0, 0, canvas.width, canvas.height);
      }, 200);
    }

    // Launch celebratory confetti in royal purple & gold
    try {
      const launchConfetti = (window as unknown as { confetti?: typeof confetti }).confetti || confetti;
      launchConfetti({
        particleCount: 130,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#3c1b5a', '#582a82', '#c59b48', '#e5cb8e', '#ffffff']
      });
      setTimeout(() => {
        launchConfetti({
          particleCount: 80,
          spread: 120,
          origin: { y: 0.55 },
          colors: ['#c59b48', '#e5cb8e', '#3c1b5a', '#f5ecfc']
        });
      }, 300);
    } catch (e) {
      console.warn('Confetti error:', e);
    }
  }

  private updateCountdown(): void {
    let target = new Date(this.wedding.event.startDateTime).getTime();
    if (isNaN(target)) {
      const parts = this.wedding.event.date.split('-');
      let y = parseInt(parts[0], 10);
      let m = parseInt(parts[1], 10);
      let d = parseInt(parts[2], 10);
      if (m > 12) {
        const temp = m;
        m = d;
        d = temp;
      }
      const timePart = this.wedding.event.startDateTime?.split('T')[1] || '10:30:00';
      target = new Date(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T${timePart}`).getTime();
    }

    if (isNaN(target)) {
      this.countdown = { days: '00', hours: '00', minutes: '00', seconds: '00' };
      return;
    }

    const diff = Math.max(0, target - Date.now());
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    this.countdown = {
      days: String(days).padStart(2, '0'),
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0')
    };
  }

  async toggleMusic(): Promise<void> {
    if (!this.audio) this.audio = new Audio('assets/wedding-music.mp3');
    try {
      if (this.musicPlaying) {
        this.audio.pause();
        this.musicPlaying = false;
      } else {
        await this.audio.play();
        this.musicPlaying = true;
      }
    } catch {
      this.musicPlaying = false;
      alert('Add your audio file at src/assets/wedding-music.mp3 to enable background music.');
    }
  }

  async submitRsvp(): Promise<void> {
    if (!this.rsvp.name.trim()) {
      this.rsvpStatus = this.ml ? 'ദയവായി നിങ്ങളുടെ പേര് നൽകുക.' : 'Please enter your name.';
      this.rsvpStatusType = 'error';
      return;
    }
    this.submitting = true;
    this.rsvpStatus = '';
    try {
      await this.firebase.submit('rsvps', { ...this.rsvp, couple: this.wedding.couple });
      this.rsvpStatus = this.ml ? 'ജസാകള്ളാഹു ഖൈർ! നിങ്ങളുടെ വിവരം രേഖപ്പെടുത്തി.' : 'Jazakallah Khair! Your RSVP has been received.';
      this.rsvpStatusType = 'success';
      this.rsvp = { name: '', phone: '', guests: 1, attending: 'yes' };
    } catch (error) {
      console.error('RSVP Submission error:', error);
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('permission-denied') || msg.includes('PERMISSION_DENIED')) {
        this.rsvpStatus = this.ml
          ? 'അനുമതി നിഷേധിച്ചു: ഫയർബേസ് കൺസോളിൽ Firestore Rules അനുവദിക്കുക.'
          : 'Permission Denied: Please update your Firestore Security Rules in Firebase Console.';
      } else {
        this.rsvpStatus = msg || 'Unable to submit. Please try again.';
      }
      this.rsvpStatusType = 'error';
    } finally {
      this.submitting = false;
    }
  }

  async submitDua(): Promise<void> {
    if (!this.dua.message.trim()) {
      this.duaStatus = this.ml ? 'ദയവായി ദുആ രേഖപ്പെടുത്തുക.' : 'Please write your dua or message.';
      this.duaStatusType = 'error';
      return;
    }
    this.submitting = true;
    this.duaStatus = '';
    try {
      await this.firebase.submit('duas', { ...this.dua, couple: this.wedding.couple });
      this.duaStatus = this.ml ? 'ആമീൻ. നിങ്ങളുടെ പ്രാർത്ഥനയ്ക്ക് നന്ദി.' : 'Ameen. Thank you for your prayers.';
      this.duaStatusType = 'success';
      this.dua = { name: '', message: '' };
    } catch (error) {
      console.error('Dua Submission error:', error);
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('permission-denied') || msg.includes('PERMISSION_DENIED')) {
        this.duaStatus = 'Permission Denied: Please update your Firestore Security Rules in Firebase Console.';
      } else {
        this.duaStatus = msg || 'Unable to submit. Please try again.';
      }
      this.duaStatusType = 'error';
    } finally {
      this.submitting = false;
    }
  }

  async submitFeedback(): Promise<void> {
    if (!this.feedback.message.trim()) {
      this.feedbackStatus = this.ml ? 'ദയവായി നിങ്ങളുടെ സന്ദേശം നൽകുക.' : 'Please enter your message.';
      this.feedbackStatusType = 'error';
      return;
    }
    this.submitting = true;
    this.feedbackStatus = '';
    try {
      await this.firebase.submit('feedback', { ...this.feedback, couple: this.wedding.couple });
      this.feedbackStatus = this.ml ? 'നന്ദി! നിങ്ങളുടെ സന്ദേശം ലഭിച്ചു.' : 'Thank you! Your message has been received.';
      this.feedbackStatusType = 'success';
      this.feedback.message = '';
    } catch (error) {
      console.error('Feedback Submission error:', error);
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('permission-denied') || msg.includes('PERMISSION_DENIED')) {
        this.feedbackStatus = 'Permission Denied: Please update your Firestore Security Rules in Firebase Console.';
      } else {
        this.feedbackStatus = msg || 'Unable to submit. Please try again.';
      }
      this.feedbackStatusType = 'error';
    } finally {
      this.submitting = false;
    }
  }

  openInvitation(): void {
    if (this.isOpening || this.invitationOpened) return;

    // Always start exactly from top
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    this.isOpening = true;

    // Trigger celebratory confetti animation in royal purple & gold
    try {
      const launchConfetti = (window as unknown as { confetti?: typeof confetti }).confetti || confetti;
      launchConfetti({
        particleCount: 140,
        spread: 90,
        origin: { y: 0.4 },
        colors: ['#3c1b5a', '#582a82', '#c59b48', '#e5cb8e', '#ffffff']
      });

      setTimeout(() => {
        launchConfetti({
          particleCount: 80,
          spread: 120,
          origin: { y: 0.32 },
          colors: ['#c59b48', '#e5cb8e', '#3c1b5a', '#f5ecfc']
        });
      }, 350);
    } catch (e) {
      console.warn('Confetti launch error:', e);
    }

    // Optional audio playback on user gesture if available
    if (!this.musicPlaying) {
      if (!this.audio) this.audio = new Audio('assets/wedding-music.mp3');
      this.audio.play().then(() => {
        this.musicPlaying = true;
      }).catch(() => {
        // Silently catch in case user has not added wedding-music.mp3
      });
    }

    // Allow the breaking & gate animations to play out before unlocking standard view
    setTimeout(() => {
      this.invitationOpened = true;
      this.isOpening = false;
      document.body.style.overflow = '';
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      setTimeout(() => this.initScratchCanvas(), 100);
    }, 1150);
  }

  showCoverAgain(): void {
    this.invitationOpened = false;
    this.isOpening = false;
    document.body.style.overflow = 'hidden';
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }

  scrollToSection(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  shareWhatsApp(): void {
    const text = `${this.wedding.shareMessage}\n${this.wedding.couple.groom} & ${this.wedding.couple.bride}\n${this.wedding.event.dateLabel}\n${this.wedding.event.venue}, ${this.wedding.event.area}`;
    const number = this.wedding.whatsappNumber;
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  }

  addToCalendar(): void {
    const start = new Date(this.wedding.event.startDateTime);
    const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);
    const format = (date: Date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const title = `Nikah Reception - ${this.wedding.couple.groom} & ${this.wedding.couple.bride}`;
    const details = `${this.wedding.event.venue}, ${this.wedding.event.area}`;
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${format(start)}/${format(end)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(details)}`;
    window.open(url, '_blank', 'noopener');
  }
}
