import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export function roleGuard(...allowedRoles: string[]): CanActivateFn {
  return (route, state) => {
    // TODO: implement real role check from AuthService/token
    return true;
  };
}
