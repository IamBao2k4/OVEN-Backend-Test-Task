import { Logger } from '@nestjs/common';

/**
 * Method decorator that logs method entry, exit, and errors
 * @param target - The prototype of the class
 * @param propertyKey - The name of the method
 * @param descriptor - The method descriptor
 */
export function LogMethod() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    const className = target.constructor.name;
    const logger = new Logger(className);

    descriptor.value = async function (...args: any[]) {
      const methodName = propertyKey;

      // Log method entry with arguments (sanitize sensitive data)
      const sanitizedArgs = sanitizeArgs(args);
      logger.log(`[${methodName}] Entry - Args: ${JSON.stringify(sanitizedArgs)}`);

      const startTime = Date.now();

      try {
        const result = await originalMethod.apply(this, args);

        const executionTime = Date.now() - startTime;

        logger.log(`[${methodName}] Success - Execution time: ${executionTime}ms`);

        return result;
      } catch (error) {
        const executionTime = Date.now() - startTime;

        logger.error(
          `[${methodName}] Error - Execution time: ${executionTime}ms - ${error.message}`,
          error.stack,
        );

        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Sanitize arguments to remove sensitive data like passwords
 * @param args - Method arguments
 * @returns Sanitized arguments
 */
function sanitizeArgs(args: any[]): any[] {
  return args.map((arg) => {
    if (typeof arg === 'object' && arg !== null) {
      const sanitized = { ...arg };

      // Remove sensitive fields
      const sensitiveFields = ['password', 'passwordHash', 'token', 'refreshToken', 'accessToken'];

      for (const field of sensitiveFields) {
        if (field in sanitized) {
          sanitized[field] = '***REDACTED***';
        }
      }

      return sanitized;
    }
    return arg;
  });
}

/**
 * Class decorator that applies LogMethod to all methods in a class
 * @param constructor - The class constructor
 */
export function LogClass() {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    const className = constructor.name;
    const logger = new Logger(className);

    logger.log(`[${className}] Class initialized`);

    // Get all method names from the prototype
    const methodNames = Object.getOwnPropertyNames(constructor.prototype).filter(
      (name) => {
        const descriptor = Object.getOwnPropertyDescriptor(constructor.prototype, name);
        return (
          name !== 'constructor' &&
          descriptor &&
          typeof descriptor.value === 'function'
        );
      },
    );

    // Apply LogMethod decorator to each method
    for (const methodName of methodNames) {
      const descriptor = Object.getOwnPropertyDescriptor(
        constructor.prototype,
        methodName,
      );

      if (descriptor) {
        LogMethod()(constructor.prototype, methodName, descriptor);
        Object.defineProperty(constructor.prototype, methodName, descriptor);
      }
    }

    return constructor;
  };
}
