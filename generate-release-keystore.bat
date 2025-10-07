@echo off
echo Generating release keystore with your information...
"C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe" -genkey -v -keystore android\app\release.keystore -alias release-key-alias -keyalg RSA -keysize 2048 -validity 10000 -storepass android -keypass android -dname "CN=chyma, OU=eazy, O=eazyE, L=Abuja, ST=Abuja, C=NG"
echo Release keystore generated successfully!