echo "Importing ethereum account";
geth account import --password /root/.ethereum/account/accountSecret /root/.ethereum/account/accountPrivateKey
OUT=$?;
if [ $OUT -eq 1 ];
then
    echo "Ethereum account already imported";
    exit 0;
else
    echo "Ethereum account imported";
fi;
