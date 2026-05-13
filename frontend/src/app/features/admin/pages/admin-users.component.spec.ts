import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AdminUsersComponent } from './admin-users.component';
import { AdminUserService } from '../../../core/services/admin-user.service';

describe('AdminUsersComponent', () => {
  let adminUserService: jasmine.SpyObj<AdminUserService>;

  beforeEach(async () => {
    adminUserService = jasmine.createSpyObj('AdminUserService', ['resetPassword']);
    adminUserService.resetPassword.and.returnValue(of({
      message: 'ok',
      user_id: 1,
    }));

    await TestBed.configureTestingModule({
      imports: [AdminUsersComponent],
      providers: [{ provide: AdminUserService, useValue: adminUserService }],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AdminUsersComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
