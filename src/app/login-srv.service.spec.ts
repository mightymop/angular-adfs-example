import { TestBed } from '@angular/core/testing';

import { LoginSrvService } from './login-srv.service';

describe('LoginSrvService', () => {
  let service: LoginSrvService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoginSrvService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
