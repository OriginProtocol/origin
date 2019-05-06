for file in *
do
  ipfs add --only-hash $file
done

