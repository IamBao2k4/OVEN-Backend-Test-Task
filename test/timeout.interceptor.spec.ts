import { ExecutionContext, CallHandler, RequestTimeoutException } from '@nestjs/common';
import { of, throwError, delay } from 'rxjs';
import { TimeoutInterceptor } from '../src/common/interceptors/timeout.interceptor';

// Mock the config
jest.mock('../src/config/config', () => ({
  appConfig: {
    requestTimeout: 5000,
  },
}));

describe('TimeoutInterceptor', () => {
  let interceptor: TimeoutInterceptor;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;

  beforeEach(() => {
    interceptor = new TimeoutInterceptor();

    mockExecutionContext = {} as ExecutionContext;

    mockCallHandler = {
      handle: jest.fn(),
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('intercept', () => {
    it('should allow request to complete within timeout', (done) => {
      const testData = { message: 'success' };
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(testData));

      const result$ = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result$.subscribe({
        next: (data) => {
          expect(data).toEqual(testData);
          done();
        },
        error: (error) => {
          done(new Error('Should not throw error'));
        },
      });
    });

    it('should throw RequestTimeoutException when request exceeds timeout', (done) => {
      // Create an observable that delays longer than the timeout
      const slowResponse$ = of({ message: 'slow' }).pipe(delay(6000));
      (mockCallHandler.handle as jest.Mock).mockReturnValue(slowResponse$);

      const result$ = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result$.subscribe({
        next: () => {
          done(new Error('Should not complete successfully'));
        },
        error: (error) => {
          expect(error).toBeInstanceOf(RequestTimeoutException);
          expect(error.message).toBe('Request timeout exceeded');
          done();
        },
      });
    }, 10000); // Increase test timeout to 10 seconds

    it('should pass through other errors without modification', (done) => {
      const customError = new Error('Custom error');
      (mockCallHandler.handle as jest.Mock).mockReturnValue(throwError(() => customError));

      const result$ = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result$.subscribe({
        next: () => {
          done(new Error('Should not complete successfully'));
        },
        error: (error) => {
          expect(error).toBe(customError);
          expect(error.message).toBe('Custom error');
          done();
        },
      });
    });

    it('should handle immediate responses', (done) => {
      const immediateData = { id: 123, name: 'test' };
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(immediateData));

      const result$ = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result$.subscribe({
        next: (data) => {
          expect(data).toEqual(immediateData);
          done();
        },
        error: () => {
          done(new Error('Should not throw error'));
        },
      });
    });

    it('should handle fast async responses', (done) => {
      const asyncData = { result: 'async success' };
      const fastResponse$ = of(asyncData).pipe(delay(100));
      (mockCallHandler.handle as jest.Mock).mockReturnValue(fastResponse$);

      const result$ = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result$.subscribe({
        next: (data) => {
          expect(data).toEqual(asyncData);
          done();
        },
        error: () => {
          done(new Error('Should not throw error'));
        },
      });
    });

    it('should handle empty responses', (done) => {
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(null));

      const result$ = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result$.subscribe({
        next: (data) => {
          expect(data).toBeNull();
          done();
        },
        error: () => {
          done(new Error('Should not throw error'));
        },
      });
    });

    it('should handle undefined responses', (done) => {
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(undefined));

      const result$ = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result$.subscribe({
        next: (data) => {
          expect(data).toBeUndefined();
          done();
        },
        error: () => {
          done(new Error('Should not throw error'));
        },
      });
    });

    it('should call the handler once', (done) => {
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of({ test: 'data' }));

      const result$ = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result$.subscribe({
        next: () => {
          expect(mockCallHandler.handle).toHaveBeenCalledTimes(1);
          done();
        },
        error: () => {
          done(new Error('Should not throw error'));
        },
      });
    });
  });
});
