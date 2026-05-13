import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AdminUserService } from './admin-user.service';
import { environment } from '@env/environment';

describe('AdminUserService', () => {
  let service: AdminUserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(AdminUserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should reset password via admin endpoint', () => {
    const userId = 42;
    service.resetPassword(userId, 'NewPass123!', 'NewPass123!').subscribe();

    const req = httpMock.expectOne(
      `${environment.apiUrl}/auth/admin/users/${userId}/reset-password/`
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      new_password: 'NewPass123!',
      new_password_confirm: 'NewPass123!',
    });
    req.flush({
      message: 'ok',
      user_id: userId,
    });
  });
});
