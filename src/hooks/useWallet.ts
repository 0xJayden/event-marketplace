import { useSession } from "next-auth/react";
import { trpc } from "../utils/trpc";
import { useEffect } from "react";
import { ethers } from "ethers";

export const useWallet = () => {
  const { data: session } = useSession();

  const getWallet = trpc.wallet.get.useQuery();
  const createWalletMutation = trpc.wallet.create.useMutation();

  useEffect(() => {
    if (session) {
      const walletExists = getWallet.data?.address;
      if (walletExists) return;

      const wallet = ethers.Wallet.createRandom();

      if (!wallet.mnemonic) return;

      createWalletMutation.mutate({
        address: wallet.address,
        privateKey: wallet.privateKey,
        publicKey: wallet.publicKey,
        mnemonic: wallet.mnemonic.phrase,
      });
    }
  }, []);

  return { address: getWallet.data?.address, session };
};
