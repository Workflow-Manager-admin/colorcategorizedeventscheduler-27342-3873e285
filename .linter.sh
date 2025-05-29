#!/bin/bash
cd /home/kavia/workspace/code-generation/colorcategorizedeventscheduler-27342-3873e285/color_categorized_event_scheduler
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

