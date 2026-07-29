import { TestBed } from '@angular/core/testing';

import { ApplicationData } from './application-data';

describe('ApplicationData', () => {
  let service: ApplicationData;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApplicationData);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
