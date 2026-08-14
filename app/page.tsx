import { ArrowDown, ArrowUpRight, TelegramLogo, XLogo } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import { AnimatedPage } from "@/components/AnimatedPage";
import { CatQuips } from "@/components/CatQuips";
import { KoratChat } from "@/components/KoratChat";
import { NetworkPanel } from "@/components/NetworkPanel";
import { ThemeToggle } from "@/components/ThemeToggle";

const telegramUrl = process.env.NEXT_PUBLIC_TELEGRAM_URL?.trim() || "https://t.me/koratrh";
const xUrl = process.env.NEXT_PUBLIC_X_URL?.trim() || "https://x.com/Koratrobinhood";

export default function Home() {
  return (
    <AnimatedPage>
      <section className="hero" id="top">
        <Image
          src="/images/korat-hero.png"
          alt="A regal silver-blue Korat cat on a vivid pistachio background"
          fill
          priority
          sizes="100vw"
          className="hero-image"
          data-hero-cat
        />
        <header className="site-header">
          <a className="brand" href="#top" aria-label="KORAT home">
            <span className="brand-mark" aria-hidden="true">
              <Image src="/images/korat-avatar.png" alt="" fill sizes="40px" />
            </span>
            <span>$KORAT</span>
          </a>
          <nav aria-label="Primary navigation">
            <a href="#lore">Lore</a>
            <a href="#ask">Ask KORAT</a>
            <a href="#chain">Chain</a>
          </nav>
          <div className="header-actions">
            {telegramUrl ? (
              <a className="header-social" href={telegramUrl} target="_blank" rel="noreferrer" aria-label="KORAT on Telegram">
                <TelegramLogo size={20} weight="fill" />
              </a>
            ) : (
              <span className="header-social is-pending" aria-label="Telegram link coming soon" title="Telegram link coming soon">
                <TelegramLogo size={20} weight="fill" />
              </span>
            )}
            {xUrl ? (
              <a className="header-social" href={xUrl} target="_blank" rel="noreferrer" aria-label="KORAT on X">
                <XLogo size={19} weight="bold" />
              </a>
            ) : (
              <span className="header-social is-pending" aria-label="X link coming soon" title="X link coming soon">
                <XLogo size={19} weight="bold" />
              </span>
            )}
            <ThemeToggle />
          </div>
        </header>

        <div className="hero-content" data-hero-copy>
          <p className="hero-eyebrow">The original good luck cat</p>
          <h1>The good luck cat comes onchain.</h1>
          <p className="hero-subtitle">Centuries of lore. Silver-blue conviction. Built for Robinhood Chain.</p>
          <div className="hero-actions">
            <a className="button button-dark" href="#ask">Ask KORAT <ArrowDown size={19} weight="bold" /></a>
            <a className="button button-clear" href="#lore">Read the lore</a>
          </div>
        </div>
      </section>

      <section className="fact-ribbon" aria-label="KORAT at a glance" data-reveal>
        <div><span>Coat</span><strong>Silver-blue</strong></div>
        <div><span>Known as</span><strong>Si-Sawat</strong></div>
        <div><span>Symbol</span><strong>Good Luck</strong></div>
        <div><span>Network</span><strong>Robinhood Chain</strong></div>
      </section>

      <section className="lore-section section" id="lore">
        <div className="lore-intro" data-reveal>
          <p className="mono-label">A real legend</p>
          <h2>
            Good luck, <span className="inline-cat" aria-hidden="true"><Image src="/images/korat-avatar.png" alt="" fill sizes="96px" /></span> long before the blockchain.
          </h2>
          <p data-scrub-text>
            {"The Korat appears in the historic Cat-Book Poems. Its silver-tipped blue coat, green eyes, and heart-shaped face made it a living symbol of prosperity."
              .split(" ")
              .map((word, index) => <span data-scrub-word key={`${word}-${index}`}>{word} </span>)}
          </p>
        </div>

        <div className="lore-grid">
          <div className="lore-photo-wrap" data-scale-image>
            <Image
              src="/images/korat-reference-lounge.jpg"
              alt="A silver-blue Korat cat reclining on a pistachio background"
              width={1254}
              height={1254}
              sizes="(max-width: 768px) 100vw, 54vw"
              className="lore-photo"
            />
          </div>
          <div className="lore-accordion" data-reveal>
            <article className="lore-accordion-item">
              <strong>Silver over blue</strong>
              <p>Each short blue hair ends in a silver tip, creating the breed&apos;s bright halo effect.</p>
            </article>
            <article className="lore-accordion-item">
              <strong>Two hearts</strong>
              <p>A heart-shaped head meets an unusually affectionate, people-focused personality.</p>
            </article>
            <article className="lore-accordion-item">
              <strong>Gifted, not sold</strong>
              <p>Tradition treated Korats as treasured gifts for good luck, happiness, and prosperous beginnings.</p>
            </article>
          </div>
        </div>

        <aside className="source-card" data-reveal>
          <div className="source-shot">
            <Image
              src="/images/korat-source-cfa.jpg"
              alt="Cat Fanciers' Association breed page for the Korat, describing it as a good luck cat with a silver blue coat and heart shaped face"
              width={1105}
              height={513}
              sizes="(max-width: 900px) 100vw, 60vw"
            />
          </div>
          <div className="source-note">
            <p className="mono-label">Primary source</p>
            <p>
              Not our words. The Cat Fanciers&apos; Association lists the Korat as a <strong>good luck cat</strong>, silver blue coat, heart shaped face, energetic and affectionate.
            </p>
            <a className="text-link" href="https://cfa.org/breed/korat/" target="_blank" rel="noreferrer">
              cfa.org/breed/korat <ArrowUpRight size={17} weight="bold" />
            </a>
          </div>
        </aside>
      </section>

      <section className="ask-section section" id="ask">
        <div className="ask-copy" data-reveal>
          <h2>Ask the cat who remembers everything.</h2>
          <p>
            One lore brain powers this website and the Telegram bot, so $KORAT keeps the story straight wherever the community gathers.
          </p>
          {telegramUrl && (
            <a className="text-link" href={telegramUrl} target="_blank" rel="noreferrer">
              Open Telegram bot <ArrowUpRight size={18} weight="bold" />
            </a>
          )}
        </div>
        <div className="ask-chat" data-reveal>
          <KoratChat />
        </div>
      </section>

      <section className="chain-section section" id="chain">
        <div data-reveal>
          <NetworkPanel />
        </div>
      </section>

      <CatQuips />

      <section className="portrait-section section">
        <div className="portrait-copy">
          <div data-reveal>
            <h2>Sharp eyes.<br />Soft paws.<br />No fake promises.</h2>
          </div>
          <div data-reveal>
            <p>
              $KORAT is a culture-first memecoin. Verify every link, confirm the contract, and remember that memes are speculative.
            </p>
          </div>
        </div>
        <div className="portrait-frame" data-scale-image>
          <Image
            src="/images/korat-avatar.png"
            alt="Close portrait of KORAT with luminous green eyes"
            width={1254}
            height={1254}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </section>

      <footer className="site-footer">
        <a className="brand footer-brand" href="#top">
          <span className="brand-mark" aria-hidden="true">
            <Image src="/images/korat-avatar.png" alt="" fill sizes="40px" />
          </span>
          $KORAT
        </a>
        <p>Independent community project. Not affiliated with or endorsed by Robinhood. Memecoins are highly speculative.</p>
        <div className="social-links">
          {telegramUrl && <a href={telegramUrl} target="_blank" rel="noreferrer" aria-label="KORAT on Telegram"><TelegramLogo size={22} weight="fill" /></a>}
          {xUrl && <a href={xUrl} target="_blank" rel="noreferrer" aria-label="KORAT on X"><XLogo size={21} weight="bold" /></a>}
        </div>
      </footer>
    </AnimatedPage>
  );
}
