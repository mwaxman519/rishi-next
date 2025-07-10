/**
 * Custom ESLint rules for Rishi Platform
 * Catches common build issues before they reach deployment
 */

module.exports = {
  rules: {
    // Rule to catch Next.js 15 async params issues
    'async-route-params': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Enforce Next.js 15 async params pattern in API routes',
          category: 'Possible Errors',
          recommended: true
        },
        fixable: 'code',
        schema: []
      },
      create(context) {
        return {
          // Check function parameters for route handlers
          FunctionDeclaration(node) {
            if (node.params.length >= 2) {
              const secondParam = node.params[1];
              
              // Check if it's a destructured params object
              if (secondParam.type === 'ObjectPattern') {
                const paramsProperty = secondParam.properties.find(
                  prop => prop.key && prop.key.name === 'params'
                );
                
                if (paramsProperty && paramsProperty.value.type === 'ObjectPattern') {
                  // Check if TypeScript annotation exists
                  const annotation = secondParam.typeAnnotation;
                  if (annotation && annotation.typeAnnotation) {
                    const typeNode = annotation.typeAnnotation;
                    
                    // Check if params is Promise<...>
                    if (typeNode.type === 'TSTypeReference' && 
                        typeNode.typeName.name === 'Promise') {
                      return; // Good - using Promise
                    }
                    
                    // Check for old pattern: { params: { id: string } }
                    if (typeNode.type === 'TSTypeLiteral') {
                      const paramsProperty = typeNode.members.find(
                        member => member.key && member.key.name === 'params'
                      );
                      
                      if (paramsProperty && 
                          paramsProperty.typeAnnotation.typeAnnotation.type === 'TSTypeLiteral') {
                        context.report({
                          node: secondParam,
                          message: 'API route params should use Promise<{ id: string }> pattern for Next.js 15 compatibility',
                          fix(fixer) {
                            // Auto-fix to wrap in Promise
                            const sourceCode = context.getSourceCode();
                            const paramText = sourceCode.getText(secondParam);
                            const fixed = paramText.replace(
                              /\{\s*params:\s*\{([^}]+)\}\s*\}/,
                              '{ params: Promise<{$1}> }'
                            );
                            return fixer.replaceText(secondParam, fixed);
                          }
                        });
                      }
                    }
                  }
                }
              }
            }
          },
          
          // Check for params destructuring without await
          VariableDeclaration(node) {
            if (node.declarations.length > 0) {
              const declaration = node.declarations[0];
              
              if (declaration.id.type === 'ObjectPattern' && 
                  declaration.init && 
                  declaration.init.name === 'params') {
                
                // Check if we're in an async function
                const functionNode = context.getAncestors().reverse().find(
                  ancestor => ancestor.type === 'FunctionDeclaration' || 
                             ancestor.type === 'ArrowFunctionExpression'
                );
                
                if (functionNode && functionNode.async) {
                  // Check if params is awaited
                  const parent = node.parent;
                  if (parent.type !== 'AwaitExpression') {
                    context.report({
                      node: declaration.init,
                      message: 'Params should be awaited in Next.js 15: const { id } = await params',
                      fix(fixer) {
                        return fixer.replaceText(declaration.init, 'await params');
                      }
                    });
                  }
                }
              }
            }
          }
        };
      }
    },
    
    // Rule to catch Promise<boolean> in conditionals
    'await-promise-conditionals': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Enforce await for Promise<boolean> in conditional statements',
          category: 'Possible Errors',
          recommended: true
        },
        fixable: 'code',
        schema: []
      },
      create(context) {
        return {
          IfStatement(node) {
            const test = node.test;
            
            // Check for function calls in conditions
            if (test.type === 'CallExpression' || 
                (test.type === 'UnaryExpression' && 
                 test.operator === '!' && 
                 test.argument.type === 'CallExpression')) {
              
              const callExpression = test.type === 'CallExpression' ? test : test.argument;
              
              // Check if we're in an async function
              const functionNode = context.getAncestors().reverse().find(
                ancestor => ancestor.type === 'FunctionDeclaration' || 
                           ancestor.type === 'ArrowFunctionExpression'
              );
              
              if (functionNode && functionNode.async) {
                // Check if the call is awaited
                if (test.type !== 'AwaitExpression' && 
                    !(test.type === 'UnaryExpression' && 
                      test.argument.type === 'AwaitExpression')) {
                  
                  // Check if function name suggests it returns a Promise
                  const functionName = callExpression.callee.name;
                  if (functionName && 
                      (functionName.includes('Permission') || 
                       functionName.includes('Async') || 
                       functionName.includes('Check'))) {
                    
                    context.report({
                      node: callExpression,
                      message: `Function ${functionName} likely returns Promise<boolean>, use await in conditional`,
                      fix(fixer) {
                        if (test.type === 'UnaryExpression') {
                          return fixer.replaceText(test, `!(await ${context.getSourceCode().getText(callExpression)})`);
                        } else {
                          return fixer.replaceText(test, `await ${context.getSourceCode().getText(callExpression)}`);
                        }
                      }
                    });
                  }
                }
              }
            }
          }
        };
      }
    }
  }
};