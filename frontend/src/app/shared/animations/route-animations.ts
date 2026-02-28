import {
  trigger,
  transition,
  style,
  animate,
  query,
  group,
} from '@angular/animations';

export const routeFadeAnimation = trigger('routeAnimations', [
  transition('* <=> *', [
    query(
      ':enter',
      [
        style({ opacity: 0, transform: 'translateY(12px)' }),
      ],
      { optional: true },
    ),
    group([
      query(
        ':leave',
        [animate('150ms ease-out', style({ opacity: 0, transform: 'translateY(-8px)' }))],
        { optional: true },
      ),
      query(
        ':enter',
        [animate('300ms 100ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))],
        { optional: true },
      ),
    ]),
  ]),
]);
