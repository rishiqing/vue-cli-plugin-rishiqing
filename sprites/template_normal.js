class Template_Normal {
  constructor (type, options) {
    this.type = type;
    this.options = options;
  }
  // drop last indentation
  dli (s) {
    const lines = s.split('\n').filter(s => s.trim().length);
    const lastIndentLength = /^\s*/.exec(lines[lines.length - 1])[0].length;
    return s
      .split('\n')
      .map(line => line.slice(lastIndentLength))
      .join('\n');
  }
  getTemplate () {
    return ((data) => {
      return this.generate(data);
    }).bind(this);
  }
  generate (data) {
    const a = this.blockSprites(data);
    const b = this.blockSpritesheet(data);
    const c = this.blockSpriteFunctions(data);
    const d = this.blockSpritesheelFunctions(data);
    return a + '\n' + b + '\n' + c + '\n' + d;
  }
  blockSprites (data, needComment = true) {
    const type = this.type;
    const comment = `
/*
  图标名列表：
  每个图标在正常屏幕分辨率下的数据，名字以 'icon-' + '配置文件名' + '-' + '图片文件名' 组合而成
  例:sprites/data/test.js 这个配置文件，glob配置的是 *.* ,意味着只匹配images文件夹下的图片
     对应src/images/icon.png这个图片，组合成的名字就是：icon-test-icon
     所以为了避免名字重合，在同一个配置文件下，如果有不同类型的图片，也不要用同样的文件名，比如icon.jpg,icon.png，这两个不要同时出现

  这个只在未配置retina的时候，@include ${type}-sprite(图标名), 来生成单个图标的css代码
*/
    `;
    const sprites = data.sprites
      .map(sprite => this.dli(`
        $${sprite.name}: (${sprite.px.x}, ${sprite.px.y}, ${sprite.px.offset_x}, ${sprite.px.offset_y}, ${sprite.px.width}, ${sprite.px.height}, ${sprite.px.total_width}, ${sprite.px.total_height}, '${sprite.escaped_image}', '${sprite.name}');
      `))
      .join('');
    return needComment ? comment + '\n' + sprites : sprites;
  }
  blockSpritesheet (data) {
    const type = this.type;
    const block_sprites_name = data.sprites
      .map(sprite => `$${sprite.name}`)
      .join(', ');

    const spritesheet = data.spritesheet;
    const block_spritesheet = this.dli(`
      $${type}-spritesheet-width: ${spritesheet.px.width};
      $${type}-spritesheet-height: ${spritesheet.px.height};
      $${type}-spritesheet-image: '${spritesheet.escaped_image}';
      $${type}-spritesheet-sprites: (${block_sprites_name}); // 图标名的组合，可以 @include ${type}-sprites($${type}-spritesheet-sprites),生成所有图标的css代码
      $${type}-spritesheet: (${spritesheet.px.width}, ${spritesheet.px.height}, '${spritesheet.escaped_image}', $${type}-spritesheet-sprites);
    `);
    return block_spritesheet;
  }
  blockSpriteFunctions (data) {
    const type = this.type;
    const block_sprite_functions = this.dli(`
      @mixin ${type}-sprite-width($sprite) {
        width: nth($sprite, 5);
      }
      @mixin ${type}-sprite-height($sprite) {
        height: nth($sprite, 6);
      }
      @mixin ${type}-sprite-position($sprite) {
        $sprite-offset-x: nth($sprite, 3);
        $sprite-offset-y: nth($sprite, 4);
        background-position: $sprite-offset-x  $sprite-offset-y;
      }
      @mixin ${type}-sprite-image($sprite) {
        $sprite-image: nth($sprite, 9);
        background-image: url(#{$sprite-image});
      }
      /*
        使用 @include ${type}-sprite(图标名),来生成单个图标的css代码
        这个也一般只在未配置retina的时候使用，如果图标有retina尺寸的，建议直接使用group,或者groups
      */
      @mixin ${type}-sprite($sprite) {
        @include ${type}-sprite-image($sprite);
        @include ${type}-sprite-position($sprite);
        @include ${type}-sprite-width($sprite);
        @include ${type}-sprite-height($sprite);
      }
    `);
    return block_sprite_functions;
  }
  blockSpritesheelFunctions (data) {
    const type = this.type;
    const block_spritesheel_functions = this.dli(`
      /*
        使用 @include ${type}-sprites($${type}-spritesheet-sprites)，即可生成所有图标的css代码
      */
      @mixin ${type}-sprites($sprites) {
        @each $sprite in $sprites {
          $sprite-name: nth($sprite, 10);
          .#{$sprite-name} {
            @include ${type}-sprite($sprite);
          }
        }
      }
    `);
    return block_spritesheel_functions;
  }
}

module.exports = Template_Normal;
