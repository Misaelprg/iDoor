import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InitialTabPage } from './initial-tab.page';

describe('InitialTabPage', () => {
  let component: InitialTabPage;
  let fixture: ComponentFixture<InitialTabPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(InitialTabPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
