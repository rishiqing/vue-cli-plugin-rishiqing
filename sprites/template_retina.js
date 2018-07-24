const Normal = require('./template_normal');

class Template_Retina extends Normal {
  generate (data) {
    const a = this.blockSprites(data);
    const b = this.blockSpritesheet(data);
    const c = this.blockGroup(data);
    const d = this.blockSpriteFunctions(data);
    const e = this.blockSpritesheelFunctions(data);
    return a + '\n' + b + '\n' + c + '\n' + d + '\n' + e;
  }
  blockSprites (data) {
    const s = super.blockSprites(data, false);
    const block_retina_sprites = data.retina_sprites
      .map(sprite => {
        const name = sprite.name.replace(/^retina_/, 'retina-');
        return this.dli(`
          $${name}: (${sprite.px.x}, ${sprite.px.y}, ${sprite.px.offset_x}, ${sprite.px.offset_y}, ${sprite.px.width}, ${sprite.px.height}, ${sprite.px.total_width}, ${sprite.px.total_height}, '${sprite.escaped_image}', '${name}');
        `)
      })
      .join('');
    return s + block_retina_sprites;
  }
  blockSpritesheet (data) {
    const type = this.type;
    const s = super.blockSpritesheet(data);
    const retina_spritesheet = data.retina_spritesheet;
    const block_retina_sprites_name = data.retina_sprites
      .map(sprite => {
        const name = sprite.name.replace(/^retina_/, 'retina-');
        return `$${name}`;
      })
      .join(', ');
    const block_retina_spritesheet = this.dli(`
      $${type}-retina-spritesheet-width: ${retina_spritesheet.px.width};
      $${type}-retina-spritesheet-height: ${retina_spritesheet.px.height};
      $${type}-retina-spritesheet-image: '${retina_spritesheet.escaped_image}';
      $${type}-retina-spritesheet-sprites: (${block_retina_sprites_name});
      $${type}-retina-spritesheet: (${retina_spritesheet.px.width}, ${retina_spritesheet.px.height}, '${retina_spritesheet.escaped_image}', $${type}-retina-spritesheet-sprites);
    `);
    return s + block_retina_spritesheet;
  }
  blockGroup (data) {
    const type = this.type;
    const retina_groups = data.retina_groups;
    const comment = `
/*
  使用 @include ${type}-retina-sprite(group), 传某个group的值即可生成对应图标的retina和普通两个版本的css代码
*/
    `;
    let block_retina_groups = comment + '\n' + retina_groups
      .map(group => {
        const groupRetinaName = group.retina.name.replace(/^retina_/, 'retina-');
        return this.dli(`
          $${group.name}-group-name: '${group.name}';
          $${group.name}-group: ('${group.name}', $${group.normal.name}, $${groupRetinaName});
        `);
      })
      .join('');
    const block_retina_groups_name = retina_groups
      .map(group => `$${group.name}-group`)
      .join(', ');
    block_retina_groups += this.dli(`
      /*
        使用 @include ${type}-retina-sprites($${type}-retina-groups),即可生成所有图标的css代码
      */
      $${type}-retina-groups: (${block_retina_groups_name});
    `);
    return block_retina_groups;
  }
  blockSpriteFunctions (data) {
    const type = this.type;
    const s = super.blockSpriteFunctions(data);
    const block_retina_sprite_functions = this.dli(`
      @mixin ${type}-sprite-background-size($sprite) {
        $sprite-total-width: nth($sprite, 7);
        $sprite-total-height: nth($sprite, 8);
        background-size: $sprite-total-width $sprite-total-height;
      }
      /*
        使用 @include ${type}-retina-sprite(group)，传某个group的值，即可生成对应图标的retina和普通两个版本的css代码
      */
      @mixin ${type}-retina-sprite($retina-group) {
        $normal-sprite: nth($retina-group, 2);
        $retina-sprite: nth($retina-group, 3);
        @include ${type}-sprite($normal-sprite);

        @media (-webkit-min-device-pixel-ratio: 2),
               (min-resolution: 192dpi) {
          @include ${type}-sprite-image($retina-sprite);
          @include ${type}-sprite-background-size($normal-sprite);
        }
      }
    `);
    return s + block_retina_sprite_functions;
  }
  blockSpritesheelFunctions (data) {
    const type = this.type;
    const s = super.blockSpritesheelFunctions(data);
    const block_retina_spritesheel_functions = this.dli(`
      /*
        使用 @include ${type}-retina-sprites($${type}-retina-groups)，传上面的groups，即可生成所有的图标的retina和普通两个版本的css代码
      */
      @mixin ${type}-retina-sprites($retina-groups) {
        @each $retina-group in $retina-groups {
          $sprite-name: nth($retina-group, 1);
          .#{$sprite-name} {
            @include ${type}-retina-sprite($retina-group);
          }
        }
      }
    `);
    return s + block_retina_spritesheel_functions;
  }
}

module.exports = Template_Retina;