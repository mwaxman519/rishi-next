&quot;use client&quot;;

export { Collapsible, CollapsibleTrigger, CollapsibleContent };

import * as React from &quot;react&quot;;
import * as CollapsiblePrimitive from &quot;@radix-ui/react-collapsible&quot;;

const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger = CollapsiblePrimitive.Trigger;

const CollapsibleContent = CollapsiblePrimitive.Content;
