import { Page } from './Page';

export class Router {
  current_page: Page;
  pages: Page[] = [];
  isHome: boolean;
  isSettings: boolean;
  isAlerts: boolean;
  isLog: boolean;
  isJournal: boolean;
  isSched: boolean;

  constructor() {
    var pageLabels: string[] = ["home", "settings", "log", "journal", "alert", "sched"];

    this.resetPageShowVariables();

    for (var page of pageLabels) {
      var newPage = new Page(page);
      if (page == "home") {
        this.isHome = true;
        this.current_page = newPage;
        newPage.showing = true;
      }
      this.pages.push(newPage);
    }
  }

  public setCurrentPage(label: string) {
    this.setPageShowVariable(label);
    if (label = this.current_page.getLabel()) {
      return;
    }
    for (var page of this.pages) {
      if (page.getLabel() === this.current_page.getLabel()) {
        page.setShowing(false);
        return;
      }
      if (page.getLabel() === label) {
        this.current_page = page;
        page.setShowing(true);
      }
    }
  }

  private setPageShowVariable(label: string) {
    this.resetPageShowVariables();

    switch (label) {
      case 'home':
        this.isHome = true;
        break;
      case 'settings':
        this.isSettings = true;
        break;
      case 'log':
        this.isLog = true;
        break;
      case 'journal':
        this.isJournal = true;
        break;
      case 'alert':
        this.isAlerts = true;
        break;
      case 'sched':
        this.isSched = true;
        break;
    }
  }

  private resetPageShowVariables() {
    this.isSettings = false;
    this.isAlerts = false;
    this.isLog = false;
    this.isJournal = false;
    this.isHome = false;
    this.isSched = false;
  }

  public isPageShowing(label: string): boolean {
    return this.current_page.getLabel() === label;
  }
}
