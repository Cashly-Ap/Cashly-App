import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LanguageService } from './language.service';

export const languageInterceptor: HttpInterceptorFn = (request, next) => {
  const language = inject(LanguageService).language();
  return next(request.clone({ setHeaders: { 'Accept-Language': language } }));
};
