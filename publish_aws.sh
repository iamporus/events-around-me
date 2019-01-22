rm -rf packaged_skill.zip
zip -r packaged_skill.zip * -x publish_aws.sh
aws lambda update-function-code --function-name events_around_me_function --zip-file fileb://packaged_skill.zip