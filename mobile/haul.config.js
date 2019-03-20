import { createWebpackConfig } from "haul";
import path from 'path'

export default {
  webpack: env => {
    const config = createWebpackConfig({
      entry: './index.js',
    })(env);

    config.resolve.alias = {
      actions: path.resolve(__dirname, 'src/actions'),
      components: path.resolve(__dirname, 'src/components'),
      reducers: path.resolve(__dirname, 'src/reducers'),
      screens: path.resolve(__dirname, 'src/screens'),
      services: path.resolve(__dirname, 'src/services'),
      utils: path.resolve(__dirname, 'src/utils'),
    }

    return config;
  }
};
