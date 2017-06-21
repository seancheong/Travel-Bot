cp -r node_modules/ build/node_modules/
cd build
zip -r ../index.zip *
cd ..
aws s3 cp ./index.zip s3://travel-bot/
# aws lambda update-function-code --function-name travel-bot --zip-file fileb://index.zip --region us-east-1
aws lambda update-function-code --function-name travel-bot --s3-bucket travel-bot --s3-key index.zip --region us-east-1
