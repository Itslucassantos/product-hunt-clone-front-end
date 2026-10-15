import { AuthButtons } from "./AuthButtons";
import { HeaderNav } from "./HeaderNav";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-content flex-wrap items-center justify-between gap-4 px-6 py-3">
        <Logo />
        <HeaderNav />
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <ThemeToggle />
          <AuthButtons />
        </div>
      </div>
    </header>
  );
}
