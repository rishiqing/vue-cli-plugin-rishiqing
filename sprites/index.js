const SpritesmithPlugin = require('webpack-spritesmith');
const path              = require('path');
const requireAll        = require('require-all');
const Template_Normal   = require('./template_normal');
const Template_Retina   = require('./template_retina');

// chainConfig是chain-webpack
// api 是 PluginApi https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-service/lib/PluginAPI.js
const spritesPlugin = function (api, chainConfig) {
  const context = requireAll(api.resolve('sprites/config')); // 配置文件必须放到根目录下的sprites/config文件夹下面
  Object.keys(context).forEach((_configName) => {
    ((configName) => {
      const imagesDir = api.resolve('src/assets/images');
      const stylesDir = api.resolve('src/styles');
      const config = context[configName];
      const cwd  = path.resolve(imagesDir, 'original-sprites', config.cwd);
      const spriteConfig = {
        src: {
          cwd: cwd,
          glob: config.glob || '*.*'
        },
        target: {
          image: path.resolve(imagesDir, 'sprites/' + configName + '-sprite.png'),
          css: [
            [
              path.resolve(stylesDir, 'sprites/' + configName + '-sprite.scss'),
              {
                format: configName + '_template'
              }
            ]
          ]
        },
        // retina: '@2x',
        apiOptions: {
          cssImageRef: 'assets/images/sprites/' + configName + '-sprite.png',
          generateSpriteName: function (fileName) {
            const parsed     = path.parse(fileName);
            const moduleName = 'icon-' + configName + parsed.dir.replace(cwd, '').replace(path.sep, '-');
            return moduleName + '-' + parsed.name;
          }
        },
        customTemplates: {
          [configName + '_template']: (new Template_Normal(configName, config)).getTemplate(),
          [configName + '_template_retina']: (new Template_Retina(configName, config)).getTemplate()
        }
      };
      // 如果配置了retina
      if (config.retina) {
        spriteConfig.retina = config.retina;
      }
      // const sprite = new SpritesmithPlugin(spriteConfig);
      // webpackConfig.plugins.push(sprite);
      chainConfig
        .plugin(`sprites-${configName}`)
        .use(SpritesmithPlugin, [spriteConfig])
    })(_configName);
  });
};

module.exports = spritesPlugin;